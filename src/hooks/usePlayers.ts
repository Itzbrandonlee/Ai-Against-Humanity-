'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { PlayerDoc } from '@/types';

export default function usePlayers(eventId?: string | string[], uid?: string | null) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const [players, setPlayers] = useState<PlayerDoc[]>([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!eId) return;
    const colRef = collection(db, 'events', eId, 'players');
    return onSnapshot(colRef, (snap) => {
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [eId]);

  useEffect(() => {
    if (uid && players.some((p) => p.id === uid)) setJoined(true);
    else setJoined(false);
  }, [uid, players]);

  const join = async (name: string) => {
    if (!eId || !uid || !name.trim()) return;
    const pref = doc(db, 'events', eId, 'players', uid);
    await setDoc(pref, { id: uid, name: name.trim(), connectedAt: Date.now() }, { merge: true });
  };

  const playersById = Object.fromEntries(players.map((p) => [p.id, p]));
  return { players, playersById, joined, join };
}

