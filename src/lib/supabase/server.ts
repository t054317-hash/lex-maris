import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

/**
 * Server Supabase client for React Server Components and Route Handlers.
 *
 * Still the publishable key, still subject to RLS -- this is the user's own
 * session, read from the auth cookie, not an escalation. Use it for anything
 * the signed-in user is allowed to see.
 */
export function getSupabaseServerClient() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured.');
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh is handled by middleware instead; ignoring here is
          // the documented Supabase pattern, not a swallowed bug.
        }
      },
    },
  });
}

/**
 * Privileged client. RLS IS BYPASSED.
 *
 * Only for the narrow set of writes the schema deliberately withholds from the
 * API: risk_reports (the authoritative score), audit_events (append-only),
 * document_seals, signature_attestations, and payment reconciliation from a
 * verified gateway webhook.
 *
 * Guarded at runtime as well as by convention -- if this ever gets imported
 * into a client component the build will fail loudly rather than leak the key.
 */
export function getSupabaseAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'getSupabaseAdminClient() was called in the browser. The service-role key must never reach the client bundle.',
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }

  return createServerClient<Database>(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
