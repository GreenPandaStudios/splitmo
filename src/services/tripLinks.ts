/**
 * Deep links are hash-based (`#/trip/<id>`) so GitHub Pages needs no rewrite rules and an installed
 * PWA opens them in-app, since the hash stays inside the manifest scope.
 */
const TRIP_HASH = /^#\/trip\/([A-Za-z0-9_-]+)/;

export function tripIdFromHash(hash: string = window.location.hash): string | null {
  const match = TRIP_HASH.exec(hash);
  return match ? match[1] : null;
}

export function tripLink(tripId: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/trip/${tripId}`;
}

export function setTripHash(tripId: string): void {
  const next = `#/trip/${tripId}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, '', next);
  }
}

/** Uses the native share sheet where available, otherwise falls back to the clipboard. */
export async function shareTripLink(tripId: string, tripName: string): Promise<'shared' | 'copied' | 'failed'> {
  const url = tripLink(tripId);
  const shareApi = navigator.share;

  if (shareApi) {
    try {
      await shareApi.call(navigator, { title: tripName, text: `Our ledger for ${tripName}`, url });
      return 'shared';
    } catch {
      // The user cancelling the sheet is not an error worth reporting as a failure.
      return 'failed';
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
