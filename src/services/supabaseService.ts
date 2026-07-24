import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { TripGroup } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  if (!config.url || !config.anonKey) return null;
  if (cachedClient && cachedUrl === config.url && cachedKey === config.anonKey) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedUrl = config.url;
    cachedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function subscribeToTripSupabase(
  config: SupabaseConfig,
  tripId: string,
  onUpdate: (trip: TripGroup) => void
): (() => void) | null {
  const client = getSupabaseClient(config);
  if (!client) return null;

  try {
    const channel = client
      .channel(`trip_${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
        (payload: any) => {
          if (payload.new && payload.new.data) {
            onUpdate(payload.new.data as TripGroup);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.error('Supabase subscription error:', err);
    return null;
  }
}

export async function syncTripToSupabase(config: SupabaseConfig, trip: TripGroup): Promise<boolean> {
  const client = getSupabaseClient(config);
  if (!client) return false;

  try {
    const { error } = await client
      .from('trips')
      .upsert({ id: trip.id, name: trip.name, data: trip, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Supabase upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync trip to Supabase:', err);
    return false;
  }
}
