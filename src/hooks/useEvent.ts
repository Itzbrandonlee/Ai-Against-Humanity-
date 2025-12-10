'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, doc, getDocs, setDoc, increment,
  onSnapshot, updateDoc, writeBatch, serverTimestamp
} from 'firebase/firestore';
import type { EventDoc } from '@/types';

export default function useEvent(eventId?: string | string[], uid?: string | null) {
  const eId = useMemo(() => (eventId ? String(eventId) : undefined), [eventId]);
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [isJudge, setIsJudge] = useState(false);
  const tag = `[useEvent ${eId}]`;

  // Event listener
  useEffect(() => {
    if (!eId) return;
    const ref = doc(db, 'events', eId);

    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data() as any;
      console.log('[EVENT SNAPSHOT]', {
        status: data.status,
        roundIndex: data.roundIndex,
        prompt: data.prompt,
        collectStartAt: Boolean(data.collectStartAt),
        collectDurationSec: data.collectDurationSec,
        usedPromptIndexes: Array.isArray(data.usedPromptIndexes) ? data.usedPromptIndexes.length : 0,
      });

      setEvent({ id: snap.id, ...data });
    });
  }, [eId]);

  // Judge = your uid matches event.judgeAuthId
  useEffect(() => {
    setIsJudge(Boolean(event && uid && event.judgeAuthId === uid));
  }, [event?.judgeAuthId, uid]);

  // UX helper: remember the key locally (not used by rules)
  const saveJudgeKey = (key: string) => { if (eId) localStorage.setItem(`judgeKey-${eId}`, key); };
  const clearJudgeKey = () => { if (eId) localStorage.removeItem(`judgeKey-${eId}`); };

  // Claim judge when unclaimed (rules gate this)
  const claimJudge = async (key: string) => {
    if (!eId || !uid || !key.trim()) return;
    await updateDoc(doc(db, 'events', eId), { judgeAuthId: uid, judgeKey: key.trim() });
    saveJudgeKey(key.trim());
  };

  // Leave judge (clear fields on event)
  const leaveJudge = async () => {
    if (!eId || !uid) return;
    await updateDoc(doc(db, 'events', eId), { judgeAuthId: null, judgeKey: null });
    clearJudgeKey();
  };

  // ---- Round flow ----

  // Start collecting: pick a random prompt from PROMPTS (no repeats until we exhaust the list)
  const startCollecting = async () => {
    console.log('[CLICK] startCollecting called from', event?.status);
    if (!eId || !isJudge || !event) return;

    // Only from JUDGING (pre-round) into COLLECTING
    if (event.status !== 'judging') return;

    try { 
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundIndex: event.roundIndex ?? 0,
          theme: event.id ?? "party",
        }),
      });

      if (!res.ok) {
        console.error("Failed to fetch API Prompt", await res.text());
        return;
      }

      const data = (await res.json()) as {prompt?: string; error?: string };
      const nextPrompt = data.prompt?.trim();
      if(!nextPrompt) {
        console.error("No prompt return from AI", data);
        return;
      }

      await updateDoc(doc(db, 'events', eId), {
        prompt: nextPrompt,
        status: 'collecting',
        winnerId: '',
        collectStartAt: serverTimestamp(),
        collectDurationSec: 60,               
      });

    } catch (err) {
      console.error("Error tarting ollecting with AI prompt", err);
    }
  };

  // Move to judging (ends the timer)
  const startJudging = async () => {
    console.log("[CLICK] startJudging called from", event?.status);
    if (!eId || !isJudge || !event) return;

  // Only from COLLECTING into JUDGING
    if (event.status !== "collecting") return;

    const roundIndex = event.roundIndex ?? 0;
    const roundId = `r-${roundIndex}`; // matches useAnswers

  // 1) If AI mode is enabled, generate an AI answer and write it as a normal answer doc
    if (event.aiEnabled && event.aiPlayerId && event.prompt) {
      try {
        const res = await fetch("/api/ai-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: event.prompt }),
        });

        if (res.ok) {
          const data = (await res.json()) as { answer?: string };

          if (data.answer) {
            console.log("[AI ANSWER] Got answer:", data.answer);

            await setDoc(
              doc(
                db,
                "events",
                eId,
                "rounds",
                roundId,
                "answers",
                event.aiPlayerId
              ),
              {
                id: event.aiPlayerId,
                playerId: event.aiPlayerId,
                text: data.answer.trim(),
                createdAt: Date.now(),
                isAi: true,
              },
              { merge: false }
            );
          } else {
            console.warn("[AI ANSWER] No answer in response");
          }
        } else {
          console.error("[AI ANSWER] API failed:", await res.text());
        }
      } catch (err) {
        console.error("[AI ANSWER] Error calling /api/ai-answer:", err);
      }
    }

  // 2) Move event into JUDGING and clear timer fields
    await updateDoc(doc(db, "events", eId), {
      status: "judging",
      collectStartAt: null,
      collectDurationSec: null,
    });
  };


  // Pick winner: reveal + award points
  const pickWinner = async (winnerPlayerId: string) => {
    if (!eId || !isJudge || !event) return;
    const b = writeBatch(db);

    b.update(doc(db, 'events', eId), { status: 'reveal', winnerId: winnerPlayerId });

    const isFinal = (event.roundIndex + 1) >= event.roundsTotal;
    const roundTwo = (event.roundIndex === 5)
    let delta = 0
    if (isFinal) {
      delta = event.pointsPerWin * 4
    } else if (roundTwo) {
      delta = event.pointsPerWin * 2
    } else {
      delta = event.pointsPerWin
    }

    b.update(doc(db, 'events', eId, 'players', winnerPlayerId), { score: increment(delta) });

    await b.commit();
  };

  // Next round or game over
  const nextRound = async () => {
    if (!eId || !isJudge || !event) return;
    const nextIndex = (event.roundIndex || 0) + 1;
    const payload: any = (nextIndex >= event.roundsTotal)
      ? { status: 'gameOver', gameOver: true }
      : { status: 'judging', winnerId: '', prompt: '', roundIndex: nextIndex };
    await updateDoc(doc(db, 'events', eId), payload);
  };

  // Play again: wipe players & answers, reset event and prompt deck
  const playAgain = async () => {
    if (!eId || !isJudge || !event) return;

    // delete all players
    const playersSnap = await getDocs(collection(db, 'events', eId, 'players'));
    for (let i = 0; i < playersSnap.docs.length; i += 400) {
      const b = writeBatch(db);
      playersSnap.docs.slice(i, i + 400).forEach(d => b.delete(d.ref));
      await b.commit();
    }

    // delete answers for all known rounds
    const total = Math.max(event.roundsTotal || 0, (event.roundIndex || 0) + 1);
    for (let r = 0; r < total; r++) {
      const ansSnap = await getDocs(collection(db, 'events', eId, 'rounds', `r-${r}`, 'answers'));
      for (let i = 0; i < ansSnap.docs.length; i += 400) {
        const b = writeBatch(db);
        ansSnap.docs.slice(i, i + 400).forEach(d => b.delete(d.ref));
        await b.commit();
      }
    }

    // reset event last (and reset used prompt deck)
    await updateDoc(doc(db, 'events', eId), {
      roundIndex: 0,
      status: 'judging',
      prompt: '',
      winnerId: '',
      gameOver: false,
      usedPromptIndexes: [],
    });
  };

  const enableAiMode = async () => {
    if (!eId || !isJudge || !event) return;
    if (event.aiEnabled) return;
    
    const aiPlayerId = 'ai-player';
    const aiPlayerName = 'GameMaster3000';

    try {
      await setDoc(
        doc(db, 'events', eId, 'players', aiPlayerId),
        {
          id: aiPlayerId,
          name: aiPlayerName,
          connectedAt: serverTimestamp(),
          score: 0,
          isAi: true,
        },
        { merge: true }
      );

      await updateDoc(doc(db, 'events', eId), {
        aiEnabled: true,
        aiPlayerId,
        aiPlayerName,
      });
      console.log('[AI MODE] Enabled on event and AI player created', eId);
    } catch (err) {
      console.log('[AI MODE] Failed to enable', err);
    }
  };

  return {
    event,
    isJudge,
    actions: { claimJudge, leaveJudge, startCollecting, startJudging, pickWinner, nextRound, playAgain, enableAiMode },
  };
}
