import type { TripGroup } from '../types';

const ALL_TRIPS_KEY = 'splitmo_all_trips_v2';
const ACTIVE_TRIP_ID_KEY = 'splitmo_active_trip_id_v2';

export function loadAllTrips(): TripGroup[] {
  try {
    const raw = localStorage.getItem(ALL_TRIPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load trips:', err);
  }
  return [];
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
    return localStorage.getItem(ACTIVE_TRIP_ID_KEY);
  } catch (err) {
    console.error('Failed to load active trip ID:', err);
  }
  return null;
}

export function saveActiveTripId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, id);
  } catch (err) {
    console.error('Failed to save active trip ID:', err);
  }
}
