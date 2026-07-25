import type { TripGroup } from '../types';
import { DEFAULT_SUPABASE_CONFIG } from './supabaseService';

const ALL_TRIPS_KEY = 'splitmo_all_trips_v2';
const ACTIVE_TRIP_ID_KEY = 'splitmo_active_trip_id_v2';

export const DEFAULT_ICELAND_TRIP: TripGroup = {
  id: 'iceland_trip_2026',
  name: 'Iceland Ring Road 🇮🇸',
  description: 'Official trip ledger imported from Splitwise (Car rental, Gas, Puffin tour, Blue Lagoon)',
  currentMemberId: 'm_august',
  supabaseConfig: DEFAULT_SUPABASE_CONFIG,
  exchangeRates: { baseCurrency: 'USD', rates: { ISK: 138.5, EUR: 0.92, USD: 1 }, lastUpdated: new Date().toISOString() },
  members: [
    { id: 'm_ashton', name: 'Ashton' },
    { id: 'm_august', name: 'August Miller' },
    { id: 'm_eugene', name: 'Eugene Miller' },
    { id: 'm_shane', name: 'Shane' },
  ],
  expenses: [
    {
      id: 'exp_1', title: 'Gas', amount: 40.04, currency: 'USD',
      amountInISK: 5546, amountInUSD: 40.04, exchangeRateUsed: 1,
      paidByMemberId: 'm_shane', date: '2026-07-22', category: 'gas', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 0 }, { memberId: 'm_august', amount: 20.02 },
        { memberId: 'm_eugene', amount: 0 }, { memberId: 'm_shane', amount: 20.02 }
      ], createdAt: new Date('2026-07-22').toISOString()
    },
    {
      id: 'exp_2', title: 'Car rental', amount: 673.13, currency: 'USD',
      amountInISK: 93229, amountInUSD: 673.13, exchangeRateUsed: 1,
      paidByMemberId: 'm_august', date: '2026-07-22', category: 'transport', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 168.28 }, { memberId: 'm_august', amount: 168.29 },
        { memberId: 'm_eugene', amount: 168.28 }, { memberId: 'm_shane', amount: 168.28 }
      ], createdAt: new Date('2026-07-22').toISOString()
    },
    {
      id: 'exp_3', title: 'Road tax', amount: 52.50, currency: 'EUR',
      amountInISK: 7904, amountInUSD: 57.07, exchangeRateUsed: 0.92,
      paidByMemberId: 'm_august', date: '2026-07-23', category: 'transport', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 13.13 }, { memberId: 'm_august', amount: 13.13 },
        { memberId: 'm_eugene', amount: 13.12 }, { memberId: 'm_shane', amount: 13.12 }
      ], createdAt: new Date('2026-07-23').toISOString()
    },
    {
      id: 'exp_4', title: 'Puffin', amount: 19600.00, currency: 'ISK',
      amountInISK: 19600, amountInUSD: 141.52, exchangeRateUsed: 138.5,
      paidByMemberId: 'm_august', date: '2026-07-23', category: 'activities', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 4900 }, { memberId: 'm_august', amount: 4900 },
        { memberId: 'm_eugene', amount: 4900 }, { memberId: 'm_shane', amount: 4900 }
      ], createdAt: new Date('2026-07-23').toISOString()
    },
    {
      id: 'exp_5', title: 'Scooters', amount: 35.76, currency: 'ISK',
      amountInISK: 36, amountInUSD: 0.26, exchangeRateUsed: 138.5,
      paidByMemberId: 'm_august', date: '2026-07-23', category: 'transport', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 11.92 }, { memberId: 'm_august', amount: 11.92 },
        { memberId: 'm_eugene', amount: 0 }, { memberId: 'm_shane', amount: 11.92 }
      ], createdAt: new Date('2026-07-23').toISOString()
    },
    {
      id: 'exp_6', title: 'Parking', amount: 717.60, currency: 'ISK',
      amountInISK: 718, amountInUSD: 5.18, exchangeRateUsed: 138.5,
      paidByMemberId: 'm_august', date: '2026-07-24', category: 'transport', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 239.20 }, { memberId: 'm_august', amount: 239.20 },
        { memberId: 'm_eugene', amount: 0 }, { memberId: 'm_shane', amount: 239.20 }
      ], createdAt: new Date('2026-07-24').toISOString()
    },
    {
      id: 'exp_7', title: 'Desserts', amount: 1300.00, currency: 'ISK',
      amountInISK: 1300, amountInUSD: 9.39, exchangeRateUsed: 138.5,
      paidByMemberId: 'm_eugene', date: '2026-07-24', category: 'food', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 433.33 }, { memberId: 'm_august', amount: 433.33 },
        { memberId: 'm_eugene', amount: 0 }, { memberId: 'm_shane', amount: 433.34 }
      ], createdAt: new Date('2026-07-24').toISOString()
    },
    {
      id: 'exp_8', title: 'Blue Lagoon (Entrance & Drinks)', amount: 62700.00, currency: 'ISK',
      amountInISK: 62700, amountInUSD: 452.71, exchangeRateUsed: 138.5,
      paidByMemberId: 'm_august', date: '2026-07-24', category: 'activities', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 0 }, { memberId: 'm_august', amount: 20900 },
        { memberId: 'm_eugene', amount: 20900 }, { memberId: 'm_shane', amount: 20900 }
      ], createdAt: new Date('2026-07-24').toISOString()
    },
    {
      id: 'exp_9', title: 'Blue Lagoon (Towels & Extras)', amount: 83.44, currency: 'USD',
      amountInISK: 11556, amountInUSD: 83.44, exchangeRateUsed: 1,
      paidByMemberId: 'm_august', date: '2026-07-24', category: 'activities', splitType: 'exact',
      splits: [
        { memberId: 'm_ashton', amount: 83.44 }, { memberId: 'm_august', amount: 0 },
        { memberId: 'm_eugene', amount: 0 }, { memberId: 'm_shane', amount: 0 }
      ], createdAt: new Date('2026-07-24').toISOString()
    }
  ],
  createdAt: new Date('2026-07-18').toISOString(),
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
