import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/login
 *
 * Credential verification is `signInWithPassword`: Supabase re-hashes the
 * supplied password with bcrypt against the stored hash, in constant time, and
 * issues the tokens on success.
 *
 * On success the session lands in HTTP-only cookies:
 *   - access token, a short-lived JWT (~1 hour), sent on every request
 *   - refresh token, opaque and rotated on each use, which middleware.ts
 *     exchanges when the access token is close to expiry
 *
 * HTTP-only matters: a token in localStorage is readable by any XSS on the
 * page. Cookies set by the SSR client are not scriptable at all.
 */

const LoginBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = LoginBody.safeParse(body);
  if (!parsed.success) {
    // Note the deliberately vague message: telling an attacker that the email
    // was malformed but the password was fine is still a hint. On a failed
    // login every rejection reads the same.
    return NextResponse.json(
      { error: 'Incorrect email or password.' },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const supabase = getSupabaseServerClient();

  /**
   * SESSION ISOLATION.
   *
   * Sign out whatever session this browser currently holds BEFORE
   * authenticating the new one. Without this, signing into account B while
   * account A's cookies are present can leave a half-replaced cookie set --
   * and any client-side cache keyed to A (React state, SWR cache, our own
   * locale and draft-order keys) survives into B's session. That is how one
   * user sees another's data.
   *
   * scope: 'local' clears only this browser. 'global' would revoke the user's
   * sessions on their other devices too, which is not what a login means.
   */
  await supabase.auth.signOut({ scope: 'local' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    // Unconfirmed address is worth distinguishing: the credentials were right,
    // and "incorrect password" would send the user to reset a password that
    // works perfectly well.
    if (/confirm/i.test(error.message)) {
      return NextResponse.json(
        { error: 'Please confirm your email address first, then sign in.' },
        { status: 403 },
      );
    }

    // Everything else collapses to one message, whether the address is unknown
    // or the password is wrong. Distinguishing them is user enumeration.
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  if (!data.session || !data.user) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  // Read the profile through the user's own session, so RLS confirms the row
  // is genuinely theirs rather than trusting the id we just received.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, locale, organisation_id')
    .eq('id', data.user.id)
    .maybeSingle();

  /**
   * A user with no profile row is locked out of everything, because every RLS
   * policy resolves through profiles. It should be impossible -- the signup
   * trigger creates it in the same transaction as the auth.users row -- but if
   * it ever happens, failing loudly here beats an empty dashboard with no
   * explanation.
   */
  if (!profile) {
    await supabase.auth.signOut({ scope: 'local' });
    return NextResponse.json(
      { error: 'This account is not fully provisioned. Please contact support.' },
      { status: 409 },
    );
  }

  await supabase
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', data.user.id);

  return NextResponse.json({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: profile.full_name,
      role: profile.role,
      locale: profile.locale,
      organisationId: profile.organisation_id,
    },
  });
}
