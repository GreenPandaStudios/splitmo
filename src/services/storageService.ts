import type { TripGroup } from '../types';
import { DEFAULT_ICELAND_TRIP } from './defaultTrip';

export { DEFAULT_ICELAND_TRIP };

const ALL_TRIPS_KEY = 'splitmo_all_trips_v5';
const ACTIVE_TRIP_ID_KEY = 'splitmo_active_trip_id_v5';
/** Which member "I am", per trip. Deliberately device-local so it is never synced to co-travelers. */
const IDENTITY_KEY = 'splitmo_identity_v5';

/** Wipe every stale splitmo localStorage key on boot. */
(function purgeStaleStorage() {
  try {
    const keepKeys = [ALL_TRIPS_KEY, ACTIVE_TRIP_ID_KEY, IDENTITY_KEY];
    const staleKeys = Object.keys(localStorage).filter(
      (k) => k.startsWith('splitmo_') && !keepKeys.includes(k),
    );
    staleKeys.forEach((k) => localStorage.removeItem(k));
    if (staleKeys.length) console.log('[splitmo] purged stale keys:', staleKeys);
  } catch { /* ignore */ }
})();

export function loadAllTrips(): TripGroup[] {
  try {
    const raw = localStorage.getItem(ALL_TRIPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = parsed.filter((t: TripGroup) => {
          if (!t || !t.id || !t.name || !Array.isArray(t.members) || !Array.isArray(t.expenses)) return false;
          if (t.id.startsWith('trip_sp_')) return false;
          const memberCorrupted = t.members.some((m) => /^[-+]?\d/.test(m.name?.trim() || ''));
          return !memberCorrupted;
        });
        if (sanitized.length > 0) return sanitized;
      }
    }
  } catch (err) {
    console.error('Failed to load trips:', err);
  }
  return [DEFAULT_ICELAND_TRIP];
}

export function saveAllTrips(trips: TripGroup[]): void {
  try {
    localStorage.setItem(ALL_TRIPS_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save trips:', err);
  }
}

export function loadActiveTripId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TRIP_ID_KEY) || DEFAULT_ICELAND_TRIP.id;
  } catch (err) {
    console.error('Failed to load active trip ID:', err);
  }
  return DEFAULT_ICELAND_TRIP.id;
}

export function saveActiveTripId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, id);
  } catch (err) {
    console.error('Failed to save active trip ID:', err);
  }
}

/** Map of tripId -> the member this device belongs to. */
export function loadIdentities(): Record<string, string> {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error('Failed to load identities:', err);
  }
  return {};
}

export function saveIdentities(identities: Record<string, string>): void {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identities));
  } catch (err) {
    console.error('Failed to save identities:', err);
  }
}
