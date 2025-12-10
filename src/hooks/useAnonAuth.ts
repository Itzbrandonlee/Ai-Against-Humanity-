'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInAnonymously } from 'firebase/auth';

export default function useAnonAuth() {
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await signInAnonymously(auth);
        unsub = onAuthStateChanged(auth, (u) => u && setUid(u.uid));
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
    return () => unsub();
  }, []);

  return { uid, error };
}
