'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { reconcileStateOwner } from '@/lib/session';

/**
 * Current Supabase session, with state isolation enforced on every change.
 *
 * `loading` is distinct from "no session" on purpose: rendering a Sign in
 * button during the initial token check makes it flicker to Sign out a moment
 * later, which reads as a bug.
 *
 * The important part is `reconcileStateOwner`. It runs on every auth event and
 * compares the incoming user id against whoever's data is cached in this
 * browser. Signing directly from account A into account B fires SIGNED_IN with
 * no SIGNED_OUT in between, so a handler that only clears on sign-out leaves
 * A's cached drafts visible to B.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      reconcileStateOwner(data.session?.user.id ?? null);
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      // TOKEN_REFRESHED fires on every silent renewal with the same user; it
      // is not an identity change and must not clear anything.
      if (event !== 'TOKEN_REFRESHED') {
        reconcileStateOwner(next?.user.id ?? null);
      }
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading } as const;
}
