'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

/**
 * Browser Supabase client.
 *
 * Uses the PUBLISHABLE key, which is safe to ship: every table it can reach is
 * gated by Row Level Security, and the tables holding secrets (document_seals,
 * signature_attestations) have RLS enabled with no policies at all, so they are
 * unreachable with this key by construction.
 *
 * The service-role key must never appear in this file or anywhere else under
 * src/ that the client bundle can reach. It bypasses RLS entirely.
 */
let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.',
    );
  }

  cached = createBrowserClient<Database>(url, key);
  return cached;
}
