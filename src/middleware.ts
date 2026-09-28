import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Session refresh and route protection.
 *
 * THIS FILE WAS MISSING, and its absence was the session bug. `server.ts`
 * swallows cookie writes with a comment saying "session refresh is handled by
 * middleware" -- but no middleware existed. The consequence: an access token
 * (15 minute life) was never refreshed, so after fifteen minutes every Server
 * Component read silently returned nothing, the user appeared logged out on a
 * hard navigation but logged in on a client one, and no error was raised
 * anywhere. That inconsistency is what "session handling issues" looks like.
 *
 * Two jobs, in this order:
 *
 *   1. Refresh. `getUser()` revalidates the token with the auth server and,
 *      when it has rotated, writes the new cookies onto the RESPONSE. This has
 *      to happen in middleware because a Server Component cannot set cookies.
 *
 *   2. Gate. Unauthenticated requests to a protected path are redirected to
 *      /login carrying a `next` parameter, so the user lands where they were
 *      going rather than on a dashboard they did not ask for.
 *
 * Read the comments on the cookie plumbing before editing it; getting it
 * subtly wrong produces sessions that work until they don't.
 */

/** Paths that require a signed-in user. Prefix match. */
const PROTECTED = ['/dashboard', '/account', '/matters'];

/** Paths a signed-in user should be bounced away from. */
const AUTH_ONLY = ['/login'];

/** Methods that change state and therefore need a same-origin check. */
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Same-origin guard for the JSON API.
 *
 * The session lives in cookies, and a browser attaches cookies to a
 * cross-site form POST. SameSite=Lax already blocks most of that, but a
 * second, independent check costs nothing: every browser sends `Origin` on a
 * cross-origin POST, so one that names another site is refused outright.
 * Requests with no Origin (server-to-server, e.g. a payment webhook) pass --
 * those must authenticate by signature instead.
 */
function isCrossSiteWrite(request: NextRequest): boolean {
  if (!UNSAFE_METHODS.has(request.method)) return false;
  if (!request.nextUrl.pathname.startsWith('/api/')) return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.nextUrl.host;
  } catch {
    return true;
  }
}

/** A path on this site. `//host` and `/\host` are both off-site in a browser. */
function isLocalPath(value: string | null): value is string {
  return !!value && /^\/(?![/\\])/.test(value) && !value.includes('\\');
}

export async function middleware(request: NextRequest) {
  if (isCrossSiteWrite(request)) {
    return NextResponse.json({ error: 'Cross-site request refused.' }, { status: 403 });
  }

  // The response must be created BEFORE the Supabase client, and the same
  // object returned at the end: it is what carries refreshed cookies back to
  // the browser. Creating a new NextResponse later would discard them.
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Without configuration there is no session to refresh and no way to
  // authorise anyone. Fail open for public paths, closed for protected ones,
  // rather than throwing on every request.
  if (!url || !key) {
    const needsAuth = PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p));
    if (!needsAuth) return response;
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/login';
    redirect.searchParams.set('error', 'not_configured');
    return NextResponse.redirect(redirect);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        // Write to both: `request` so anything downstream in this same pass
        // sees the new value, and `response` so the browser actually receives
        // it. Setting only one is the classic half-working session.
        for (const { name, value } of toSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser(), not getSession(): getSession() trusts whatever is in the cookie
  // without contacting the auth server, so a revoked or forged token would
  // pass. getUser() verifies it. On a protected route that distinction is the
  // whole point of the check.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && PROTECTED.some((p) => pathname.startsWith(p))) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/login';
    // Preserve the intended destination, path only -- never echo back an
    // absolute URL from user input, which is an open-redirect.
    redirect.searchParams.set('next', pathname);
    return NextResponse.redirect(redirect);
  }

  if (user && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
    const redirect = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get('next');
    // Path only, and never protocol-relative: `?next=//evil.com` would
    // otherwise send a freshly signed-in user to another site.
    redirect.pathname = isLocalPath(next) ? next : '/dashboard';
    redirect.search = '';
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  /**
   * Skip static assets and image optimisation: they neither need a session nor
   * benefit from one, and running auth on every asset request would add a
   * round trip to the auth server per file.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)'],
};
