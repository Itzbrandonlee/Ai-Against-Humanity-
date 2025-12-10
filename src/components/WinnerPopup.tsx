'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PlayerDoc, AnswerDoc } from '@/types';

export default function WinnerPopup({
  winnerId,
  playersById,
  answers,
}: {
  winnerId?: string;
  playersById: Record<string, PlayerDoc>;
  answers: AnswerDoc[], 
}) {
  const [open, setOpen] = useState(false);
  const fired = useRef(false);

  const winner = winnerId ? playersById[winnerId] : undefined
  const winnerName = useMemo(
    () => (winnerId ? (playersById[winnerId]?.name ?? 'TBA') : ''),
    [winnerId, playersById]
  );

  const winnerAnswer = useMemo(() => {
    if (!winnerId) return '';
    return (answers ?? []).find(a => a.playerId === winnerId)?.text ?? '';
    }, [answers, winnerId]);

  const aiWon = !!winner?.isAi;
  
  useEffect(() => {
    let cleanup = false;

    async function fire() {
      const mod = await import('canvas-confetti');
      const confetti = mod.default || (mod as any);

      // 3 quick bursts
      confetti({ particleCount: 80, spread: 70, startVelocity: 45, gravity: 0.9, ticks: 200, origin: { x: 0.5, y: 0.6 } });
      setTimeout(() => !cleanup && confetti({ particleCount: 60, spread: 70, startVelocity: 45, gravity: 0.9, ticks: 200, origin: { x: 0.2, y: 0.7 } }), 200);
      setTimeout(() => !cleanup && confetti({ particleCount: 60, spread: 70, startVelocity: 45, gravity: 0.9, ticks: 200, origin: { x: 0.8, y: 0.7 } }), 350);
    }

    if (winnerId) {
      setOpen(true);
      if (!fired.current) {
        fired.current = true;
        fire();
      }
    } else {
      fired.current = false;
      setOpen(false);
    }

    return () => {
      cleanup = true;
    };
  }, [winnerId]);

  if (!winnerId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-900 to-cyan-950 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl sm:text-3xl font-extrabold">
            🏆 We have a winner!
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 text-center">
          <div className="text-3xl sm:text-5xl font-black leading-tight">
            {winnerName}
          </div>
          {winnerAnswer && (
          <p className="mt-2 text-sm opacity-80">{winnerAnswer} 🎉</p>
          )}
          {aiWon && (
          <p className="mt-2 text-sm text-amber-300">
          🤖 You picked the AI&apos;s answer!
          </p>
          )}
          <div className="mt-5">
            <Button onClick={() => setOpen(false)} className="bg-fuchsia-400 text-black font-semibold">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
