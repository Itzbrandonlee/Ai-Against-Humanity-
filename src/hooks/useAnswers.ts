'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import type { AnswerDoc } from '@/types';

export default function useAnswers(
  eventId?: string | string[],
  roundIndex?: number,
  uid?: string | null
) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const [answers, setAnswers] = useState<AnswerDoc[]>([]);

  useEffect(() => {
    setAnswers([]);
    if (!eId || typeof roundIndex !== 'number') return;
    const roundId = `r-${roundIndex}`;
    const colRef = collection(db, 'events', eId, 'rounds', roundId, 'answers');
    const q = query(colRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      setAnswers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [eId, roundIndex]);

  const submitAnswer = async (text: string, status?: string) => {
    if (!eId || typeof roundIndex !== 'number' || !uid) return;
    if (!text.trim()) return;
    // Optional: enforce only during collecting in UI
    const roundId = `r-${roundIndex}`;
    const aRef = doc(db, 'events', eId, 'rounds', roundId, 'answers', uid); // one per player per round
    await setDoc(aRef, {
      id: uid,
      playerId: uid,
      text: text.trim(),
      createdAt: Date.now(),
    }, { merge: false });
  };

  const submitted = answers.some((a) => a.id === uid);
  return { answers, submitAnswer, submitted };
}

