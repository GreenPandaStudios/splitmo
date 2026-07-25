import { useEffect, useMemo, useRef, useState } from 'react';
import type { TripGroup, CurrencyCode, Expense } from '../types';
import {
  loadAllTrips, saveAllTrips, saveActiveTripId, loadIdentities, saveIdentities,
  subscribeToTripSupabase, syncTripToSupabase, fetchAllTripsFromSupabase,
  DEFAULT_SUPABASE_CONFIG, DEFAULT_ICELAND_TRIP,
} from '../services';

/** Trips whose ids carry the `trip_sp_` prefix came from a corrupted sync and are not persisted. */
const isPersistable = (trip: TripGroup) => !trip.id.startsWith('trip_sp_');

/** Owns the trip collection: hydration, Supabase sync, and every mutation the UI performs. */
export function useTripStore() {
  const [trips, setTrips] = useState<TripGroup[]>(() => loadAllTrips().filter(isPersistable));
  const [activeTripId, setActiveTripId] = useState<string | null>(DEFAULT_ICELAND_TRIP.id);
  const [identities, setIdentities] = useState<Record<string, string>>(loadIdentities);
  const [isLoading, setIsLoading] = useState(true);
  /** Client-clock timestamp of the newest local edit, used to reject stale realtime echoes. */
  const lastLocalMutationAt = useRef(0);

  useEffect(() => {
    fetchAllTripsFromSupabase(DEFAULT_SUPABASE_CONFIG)
      .then((remotes) => {
        if (remotes && remotes.length > 0) {
          setTrips(remotes);
          setActiveTripId(remotes[0].id);
        } else {
          setTrips([DEFAULT_ICELAND_TRIP]);
          setActiveTripId(DEFAULT_ICELAND_TRIP.id);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) || trips[0] || DEFAULT_ICELAND_TRIP,
    [trips, activeTripId]
  );

  useEffect(() => {
    if (isLoading || trips.length === 0 || !isPersistable(activeTrip)) return;
    saveAllTrips(trips);
    if (activeTripId) saveActiveTripId(activeTripId);
    syncTripToSupabase(activeTrip.supabaseConfig || DEFAULT_SUPABASE_CONFIG, activeTrip);
  }, [trips, activeTripId, activeTrip, isLoading]);

  useEffect(() => {
    if (!isPersistable(activeTrip)) return;
    const cfg = activeTrip.supabaseConfig || DEFAULT_SUPABASE_CONFIG;
    const unsub = subscribeToTripSupabase(cfg, activeTrip.id, (remote: TripGroup, updatedAt?: string) => {
      // Realtime echoes this client's own writes back. An echo stamped before our latest local
      // edit describes older state, so applying it would silently discard that edit.
      const remoteTime = updatedAt ? new Date(updatedAt).getTime() : Date.now();
      if (remoteTime < lastLocalMutationAt.current) return;
      setTrips((prev) => prev.map((t) => (t.id === remote.id ? remote : t)));
    });
    return () => { if (unsub) unsub(); };
  }, [activeTrip.id, activeTrip.supabaseConfig]);

  /**
   * Who this device is on the active trip. Kept out of the synced TripGroup so that changing it
   * never rewrites the identity for co-travelers; the trip's own field is only a first-run default.
   */
  const currentMemberId =
    identities[activeTrip.id] || activeTrip.currentMemberId || activeTrip.members[0]?.id;

  const setCurrentMember = (memberId: string, tripId: string = activeTrip.id) => {
    setIdentities((prev) => {
      const next = { ...prev, [tripId]: memberId };
      saveIdentities(next);
      return next;
    });
  };

  const updateCurrentTrip = (updater: (t: TripGroup) => TripGroup) => {
    lastLocalMutationAt.current = Date.now();
    setTrips((prev) => prev.map((t) => (t.id === activeTrip.id ? updater(t) : t)));
  };

  const createTrip = (
    name: string,
    description: string,
    homeCurrency: CurrencyCode,
    initialMembers: string[]
  ): TripGroup => {
    const members = initialMembers.map((memberName, idx) => ({ id: `m_${Date.now()}_${idx}`, name: memberName }));
    const newTrip: TripGroup = {
      id: `trip_${Date.now()}`, name, description,
      supabaseConfig: DEFAULT_SUPABASE_CONFIG, currentMemberId: members[0]?.id,
      exchangeRates: { baseCurrency: homeCurrency, rates: {}, lastUpdated: new Date().toISOString() },
      members, expenses: [], createdAt: new Date().toISOString(),
    };
    lastLocalMutationAt.current = Date.now();
    setTrips((prev) => [...prev, newTrip]);
    setActiveTripId(newTrip.id);
    return newTrip;
  };

  const importTrip = (importedTrip: TripGroup) => {
    lastLocalMutationAt.current = Date.now();
    setTrips((prev) => [...prev, importedTrip]);
    setActiveTripId(importedTrip.id);
  };

  const deleteTrip = (id: string) => {
    lastLocalMutationAt.current = Date.now();
    const remaining = trips.filter((t) => t.id !== id);
    setTrips(remaining);
    if (activeTripId === id) setActiveTripId(remaining[0]?.id || null);
  };

  /** Upsert: replaces the entry when its id is already on the ledger, otherwise prepends it. */
  const saveExpense = (expense: Expense) =>
    updateCurrentTrip((t) => ({
      ...t,
      expenses: t.expenses.some((e) => e.id === expense.id)
        ? t.expenses.map((e) => (e.id === expense.id ? expense : e))
        : [expense, ...t.expenses],
    }));

  const deleteExpense = (id: string) =>
    updateCurrentTrip((t) => ({ ...t, expenses: t.expenses.filter((e) => e.id !== id) }));

  return {
    trips, activeTrip, isLoading,
    currentMemberId, setCurrentMember,
    setActiveTripId, updateCurrentTrip,
    createTrip, importTrip, deleteTrip,
    saveExpense, deleteExpense,
  };
}
