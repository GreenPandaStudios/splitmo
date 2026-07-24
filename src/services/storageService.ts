import type { TripGroup } from '../types';
import { DEFAULT_ISK_PER_USD } from './currencyService';

const ALL_TRIPS_KEY = 'splitmo_all_trips_v1';
const ACTIVE_TRIP_ID_KEY = 'splitmo_active_trip_id_v1';

export const INITIAL_ICELAND_TRIP: TripGroup = {
  id: 'iceland_trip_2026',
  name: 'Iceland Ring Road 🇮🇸',
  description: '7-day roadtrip splitting gas, Airbnb, and Bónus groceries in ISK & USD.',
  exchangeRates: {
    baseCurrency: 'USD',
    rates: { ISK: DEFAULT_ISK_PER_USD },
    lastUpdated: new Date().toISOString(),
  },
  customIskToUsdRate: DEFAULT_ISK_PER_USD,
  supabaseConfig: {
    url: 'https://zhugeagqnhwypklwsxzz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodWdlYWdxbmh3eXBrbHdzeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MjYzNzUsImV4cCI6MjEwMDUwMjM3NX0.-tMZPSyamR9GpWlFxNgsgRCNvpty5wAoKdhGu_OpAe8',
  },
  members: [
    { id: 'm1', name: 'Alice (Trip Lead)' },
    { id: 'm2', name: 'Bob' },
    { id: 'm3', name: 'Charlie' },
    { id: 'm4', name: 'Dana' },
  ],
  expenses: [
    {
      id: 'e1',
      title: 'Bónus Groceries & Snacks',
      amount: 24500,
      currency: 'ISK',
      amountInISK: 24500,
      amountInUSD: 176.9,
      exchangeRateUsed: 138.5,
      paidByMemberId: 'm1',
      date: '2026-07-20',
      category: 'groceries',
      splitType: 'equal',
      splits: [
        { memberId: 'm1', amount: 6125 },
        { memberId: 'm2', amount: 6125 },
        { memberId: 'm3', amount: 6125 },
        { memberId: 'm4', amount: 6125 },
      ],
      createdAt: '2026-07-20T10:00:00Z',
    },
    {
      id: 'e2',
      title: 'N1 Gasoline fill-up (Reykjavík)',
      amount: 18200,
      currency: 'ISK',
      amountInISK: 18200,
      amountInUSD: 131.41,
      exchangeRateUsed: 138.5,
      paidByMemberId: 'm2',
      date: '2026-07-21',
      category: 'gas',
      splitType: 'equal',
      splits: [
        { memberId: 'm1', amount: 4550 },
        { memberId: 'm2', amount: 4550 },
        { memberId: 'm3', amount: 4550 },
        { memberId: 'm4', amount: 4550 },
      ],
      createdAt: '2026-07-21T14:30:00Z',
    },
  ],
};

export function loadAllTrips(): TripGroup[] {
  try {
    const raw = localStorage.getItem(ALL_TRIPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load trips:', err);
  }
  return [INITIAL_ICELAND_TRIP];
}

export function saveAllTrips(trips: TripGroup[]): void {
  try {
    localStorage.setItem(ALL_TRIPS_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save trips:', err);
  }
}

export function loadActiveTripId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_TRIP_ID_KEY);
    if (id) return id;
  } catch (err) {
    console.error('Failed to load active trip ID:', err);
  }
  return INITIAL_ICELAND_TRIP.id;
}

export function saveActiveTripId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, id);
  } catch (err) {
    console.error('Failed to save active trip ID:', err);
  }
}
