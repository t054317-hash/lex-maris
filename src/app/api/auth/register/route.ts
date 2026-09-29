import { NextResponse } from 'next/server';
import { z } from 'zod';
import { LOCALES } from '@/i18n/config';
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/register
 *
 * Password hashing: bcrypt, performed by Supabase Auth inside `signUp`. There
 * is deliberately no bcrypt call in this file. Hashing here as well would mean
 * two password stores, two reset flows, and an RLS model (every policy keyed on
 * auth.uid()) that only knows about one of them.
 *
 * Duplicate prevention runs at three depths, so no single failure lets a
 * duplicate through:
 *
 *   1. This explicit pre-check, which produces the exact message the product
 *      asks for.
 *   2. A UNIQUE index on profiles.email (citext, so case-insensitive).
 *   3. Supabase Auth's own unique index on auth.users.email.
 *
 * The pre-check alone would be a race: two simultaneous requests for the same
 * address both see "not taken" and both proceed. Layers 2 and 3 are what
 * actually make it safe; the check exists for the error message, not the
 * guarantee. The 23505 handler below catches the race.
 */

const RegisterBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  // 8 is the floor, not a recommendation. Length beats composition rules.
  password: z.string().min(8).max(200),
  fullName: z.string().trim().max(160).optional(),
  organisationName: z.string().trim().max(200).optional(),
  inviteToken: z.string().trim().max(200).optional(),
  locale: z.enum(LOCALES).optional(),
});

/**
 * Whether to tell an anonymous caller that an address is already registered.
 *
 * TRADE-OFF, stated plainly: the requested message confirms which addresses
 * hold accounts, which is user enumeration. For a consumer service that is a
 * real leak. For a legal practice it also reveals who is a client -- arguably
 * privileged in itself.
 *
 * It is enabled because it was explicitly asked for, and because the sign-up
 * form is the one place users genuinely need it. Set
 * AUTH_REVEAL_EXISTING_EMAIL=false to switch to the neutral behaviour, where
 * the response is identical either way and an email is sent to the existing
 * address instead.
 */
const REVEAL_EXISTING = process.env.AUTH_REVEAL_EXISTING_EMAIL !== 'false';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = RegisterBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the details you entered.',
        // Field-level detail so the form can mark the offending input.
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { email, password, fullName, organisationName, inviteToken, locale } = parsed.data;

  // --- 1. Pre-check, for the message ---------------------------------------
  // Uses the admin client because profiles is behind RLS and the caller is
  // anonymous. It reads one boolean about one address and returns nothing else.
  //
  // OPTIONAL. Without SUPABASE_SERVICE_ROLE_KEY this step is skipped rather
  // than failing every registration (which is what it used to do: the admin
  // client threw, the route 500'd, and every visitor saw "something went
  // wrong"). Duplicates are still caught below -- by Supabase's empty
  // `identities` response and by the unique indexes.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = getSupabaseAdminClient();
    const { data: existing, error: lookupError } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .is('deleted_at', null)
      .maybeSingle();

    if (lookupError) {
      console.error('[register] duplicate pre-check failed', lookupError.message);
    } else if (existing && REVEAL_EXISTING) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 },
      );
    }
  }

  // --- 2. Create the user ---------------------------------------------------
  // The user's own client, so the resulting session is written to THIS
  // browser's cookies. The admin client would create the user with no session.
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The confirmation link returns through the callback, which exchanges
      // the one-time code and signs the user straight in.
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard`,
      // Consumed by app.handle_new_user(), which resolves the organisation:
      // a valid invite joins an existing firm, otherwise a new one is founded.
      data: {
        full_name: fullName ?? '',
        organisation_name: organisationName ?? '',
        invite_token: inviteToken ?? '',
        locale: locale ?? 'en',
      },
    },
  });

  if (error) {
    // The unique indexes won the race described above.
    // Not a bare 422: Supabase also uses 422 for a weak password, which must
    // not be reported as "account already exists".
    const isDuplicate =
      error.code === 'user_already_exists' ||
      error.code === 'email_exists' ||
      error.code === '23505' ||
      /already registered|already exists|duplicate/i.test(error.message);

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 },
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    console.error('[register] signUp failed', error.code, error.message);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 422 });
  }

  /**
   * Supabase deliberately returns a user-shaped object with an EMPTY
   * `identities` array when the address was already registered, rather than
   * erroring -- that is its anti-enumeration behaviour. Without this check a
   * duplicate signup looks like a success and the user waits forever for a
   * confirmation email that will never arrive.
   */
  const looksLikeExistingUser =
    data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;

  if (looksLikeExistingUser) {
    return NextResponse.json(
      REVEAL_EXISTING
        ? { error: 'An account with this email already exists. Please log in.' }
        : { ok: true, confirmationRequired: true },
      { status: REVEAL_EXISTING ? 409 : 200 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      // With email confirmation on there is no session yet; the form must say
      // "check your email" rather than redirect to the dashboard.
      confirmationRequired: !data.session,
      userId: data.user?.id ?? null,
    },
    { status: 201 },
  );
}
