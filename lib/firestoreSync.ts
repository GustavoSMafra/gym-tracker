import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { GymTrackerData } from './types';

// One document per signed-in user, keyed by Firebase Auth uid — Firestore
// security rules should restrict each doc to `request.auth.uid == uid`.
const COLLECTION = 'gymTrackerData';

export async function downloadRemoteData(uid: string): Promise<GymTrackerData | null> {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, COLLECTION, uid));
  return snapshot.exists() ? (snapshot.data() as GymTrackerData) : null;
}

export async function uploadRemoteData(uid: string, data: GymTrackerData): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, COLLECTION, uid), data);
}

// Last-write-wins on updatedAt: whichever copy is newer becomes the merged
// result. Single-user/single-device, so no field-level conflict resolution.
export function mergeByRecency(local: GymTrackerData, remote: GymTrackerData): GymTrackerData {
  return remote.updatedAt > local.updatedAt ? remote : local;
}
