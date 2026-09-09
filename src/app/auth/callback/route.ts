import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback — OAuth return leg (Google, and any provider added later).
 *
 * Google redirects here with a one-time `code`. Exchanging it sets the session
 * cookies; there is no token in the URL and nothing sensitive in the query
 * string, which is the point of the PKCE flow.
 *
 * First sign-in creates the profile through app.handle_new_user(), which reads
 * the provider from raw_app_meta_data and stores auth_provider = 'google'. A
 * returning user just gets a session. Both cases land here identically -- the
 * "create if new, log in if existing" branch lives in the database trigger,
 * not in this handler, so it cannot be bypassed by hitting a different route.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const oauthError = url.searchParams.get('error');
  const rawNext = url.searchParams.get('next');

  // Only ever redirect to a path on this origin. Echoing back a full URL from
  // the query string is an open redirect.
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
    ? rawNext
    : '/dashboard';

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, url.origin));

  // The user declined consent, or Google rejected the request.
  if (oauthError) return fail(oauthError);
  if (!code) return fail('missing_code');

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Most often a reused or expired code -- someone refreshing the callback
    // URL. Send them back to sign in rather than showing a raw error.
    return fail(error.message);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
