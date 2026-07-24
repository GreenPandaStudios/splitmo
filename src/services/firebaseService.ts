import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, DocumentSnapshot } from 'firebase/firestore';
import type { TripGroup } from '../types';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  appId?: string;
}

let isInitialized = false;

export function initFirebase(config: FirebaseConfig) {
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const db = getFirestore(app);
    isInitialized = true;
    return { app, db };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    isInitialized = false;
    return null;
  }
}

export function subscribeToTrip(
  config: FirebaseConfig,
  tripId: string,
  onUpdate: (trip: TripGroup) => void
): (() => void) | null {
  const fb = initFirebase(config);
  if (!fb) return null;

  try {
    const docRef = doc(fb.db, 'trips', tripId);
    return onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as TripGroup);
        }
      },
      (err: Error) => console.error('Firebase sync error:', err)
    );
  } catch (err) {
    console.error('Failed to subscribe to Firebase doc:', err);
    return null;
  }
}

export async function syncTripToFirebase(config: FirebaseConfig, trip: TripGroup): Promise<boolean> {
  const fb = initFirebase(config);
  if (!fb) return false;

  try {
    const docRef = doc(fb.db, 'trips', trip.id);
    await setDoc(docRef, trip, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to sync trip to Firebase:', err);
    return false;
  }
}

export function isFirebaseReady(): boolean {
  return isInitialized;
}
