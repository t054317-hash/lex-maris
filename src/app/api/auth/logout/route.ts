import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/logout
 *
 * Revokes the refresh token server-side and clears the auth cookies. POST, not
 * GET: a GET logout can be triggered by any <img src> on any page the user
 * visits, which is CSRF-able logout.
 *
 * `scope: 'local'` ends this browser's session only. A user signing out on a
 * shared machine does not expect their phone to be signed out too; use
 * scope 'global' for an explicit "sign out everywhere" control.
 *
 * The client is responsible for the other half of isolation -- discarding any
 * cached per-user state. See clearUserScopedState() in src/lib/session.ts.
 */
export async function POST() {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    // The cookies are cleared regardless, so the user IS signed out here even
    // if the token could not be revoked upstream. Report it rather than
    // pretending, but do not leave them stuck on a page they cannot use.
    return NextResponse.json(
      { ok: true, warning: 'Signed out locally; the server could not revoke the token.' },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true });
}
