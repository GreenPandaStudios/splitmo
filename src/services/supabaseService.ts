import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { TripGroup } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: 'https://zhugeagqnhwypklwsxzz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodWdlYWdxbmh3eXBrbHdzeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MjYzNzUsImV4cCI6MjEwMDUwMjM3NX0.-tMZPSyamR9GpWlFxNgsgRCNvpty5wAoKdhGu_OpAe8',
};

const clientCache = new Map<string, SupabaseClient>();

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const cfg = config?.url && config?.anonKey ? config : DEFAULT_SUPABASE_CONFIG;
  if (!cfg.url || !cfg.anonKey) return null;
  const key = `${cfg.url}:${cfg.anonKey}`;
  if (!clientCache.has(key)) {
    clientCache.set(key, createClient(cfg.url, cfg.anonKey));
  }
  return clientCache.get(key) || null;
}

export async function syncTripToSupabase(config: SupabaseConfig | undefined, trip: TripGroup): Promise<boolean> {
  const client = getSupabaseClient(config);
  if (!client) return false;
  try {
    const { error } = await client.from('trips').upsert({
      id: trip.id,
      name: trip.name,
      data: trip,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync trip to Supabase:', err);
    return false;
  }
}

export function subscribeToTripSupabase(
  config: SupabaseConfig | undefined,
  tripId: string,
  onRemoteUpdate: (trip: TripGroup) => void
): (() => void) | null {
  const client = getSupabaseClient(config);
  if (!client) return null;

  const channel = client
    .channel(`trip_${tripId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
      (payload) => {
        if (payload.new?.data) {
          onRemoteUpdate(payload.new.data as TripGroup);
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
