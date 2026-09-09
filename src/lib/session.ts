'use client';

/**
 * Client-side session isolation.
 *
 * Clearing the auth cookie is only half of signing out. The other half is
 * everything the browser cached WHILE signed in: draft orders, a remembered
 * matter filter, a half-filled checkout, any query cache. None of it is
 * protected by RLS, because it already left the database.
 *
 * The failure this prevents: user A signs out on a shared machine, user B
 * signs in, and B sees A's draft instruction with A's counterparty and
 * contract value sitting in the checkout form. No server bug required.
 *
 * Rule for anything added later: if a value is specific to one user, its key
 * must start with USER_SCOPED_PREFIX so it is cleared here. Preferences that
 * belong to the DEVICE rather than the person -- the locale, a collapsed
 * sidebar -- deliberately survive, since re-picking your language on every
 * sign-in is its own annoyance.
 */

/** Keys wiped on any change of identity. */
export const USER_SCOPED_PREFIX = 'lexmaris.u.';

/** Keys that survive, because they describe the device, not the person. */
const DEVICE_SCOPED = ['lexmaris_locale'];

export function userScopedKey(name: string): string {
  return `${USER_SCOPED_PREFIX}${name}`;
}

/**
 * Remove every user-scoped value from both storages.
 *
 * Wrapped in try/catch throughout: in a private window, or with site data
 * blocked, merely READING localStorage throws. A failure to clear must not
 * take down the sign-out flow -- but it also must not pass silently, hence the
 * returned count.
 */
export function clearUserScopedState(): number {
  let cleared = 0;

  for (const store of [
    typeof window === 'undefined' ? null : window.localStorage,
    typeof window === 'undefined' ? null : window.sessionStorage,
  ]) {
    if (!store) continue;
    try {
      // Collect first, then delete: removing while iterating by index skips
      // entries, because the indices shift under you.
      const doomed: string[] = [];
      for (let i = 0; i < store.length; i += 1) {
        const key = store.key(i);
        if (!key) continue;
        if (key.startsWith(USER_SCOPED_PREFIX) && !DEVICE_SCOPED.includes(key)) {
          doomed.push(key);
        }
      }
      for (const key of doomed) {
        store.removeItem(key);
        cleared += 1;
      }
    } catch {
      // Storage unavailable. Nothing cached, so nothing to leak.
    }
  }

  return cleared;
}

/**
 * The id whose cached state is currently in this browser.
 *
 * Compared on every auth event so that a *switch* of user is caught, not only
 * a sign-out. Signing straight from account A into account B fires SIGNED_IN
 * without a SIGNED_OUT in between, which is exactly the case a naive
 * "clear on sign out" handler misses.
 */
const OWNER_KEY = 'lexmaris.stateOwner';

export function getStateOwner(): string | null {
  try {
    return window.localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}

export function setStateOwner(userId: string | null): void {
  try {
    if (userId) window.localStorage.setItem(OWNER_KEY, userId);
    else window.localStorage.removeItem(OWNER_KEY);
  } catch {
    // Ignored: without storage there is no cached state to own.
  }
}

/**
 * Reconcile cached state against the current user. Call on every auth change.
 * Returns true when state was discarded, so the caller can drop in-memory
 * caches too -- localStorage is not the only place stale data hides.
 */
export function reconcileStateOwner(userId: string | null): boolean {
  const owner = getStateOwner();

  if (userId === null) {
    if (owner !== null) {
      clearUserScopedState();
      setStateOwner(null);
      return true;
    }
    return false;
  }

  if (owner !== userId) {
    clearUserScopedState();
    setStateOwner(userId);
    // Only report a discard when there was a PREVIOUS owner. A first sign-in
    // on a fresh browser is not a switch, and reporting it would make callers
    // needlessly throw away a cache they just built.
    return owner !== null;
  }

  return false;
}
