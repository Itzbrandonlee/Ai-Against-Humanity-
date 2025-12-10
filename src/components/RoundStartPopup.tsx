'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { EventStatus } from '@/types';

type Props = {
  roundIndex: number;       // 0-based
  roundsTotal: number;
  status: EventStatus;      // 'collecting' | 'judging' | 'reveal' | 'gameOver'
  autoCloseMs?: number;
};

function pointsForRound(n: number) {
  if (n >= 11) return 200;
  if (n >= 6)  return 100;
  return 50;
}

export default function RoundStartPopup({
  roundIndex,
  roundsTotal,
  status,
  autoCloseMs = 1800,
}: Props) {
  const [open, setOpen] = useState(false);
  const prevStatus = useRef<EventStatus | null>(null);
  const prevRound = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roundNumber = useMemo(() => roundIndex + 1, [roundIndex]);
  const pts = useMemo(() => pointsForRound(roundNumber), [roundNumber]);

  useEffect(() => {
    const enteringCollecting =
      status === 'collecting' &&
      (prevStatus.current !== 'collecting' || prevRound.current !== roundIndex);

    if (enteringCollecting) {
      setOpen(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen(false), autoCloseMs);
    }

    prevStatus.current = status;
    prevRound.current = roundIndex;

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [status, roundIndex, autoCloseMs]);

  if (status === 'gameOver') return null;

  const title = roundNumber >= 11 ? 'Final Round!' : `Round ${roundNumber} / ${roundsTotal}`;
  const sub =
    roundNumber >= 11
      ? `Final round worth ${pts} pts!`
      : roundNumber >= 6
        ? `Points are doubled — ${pts} pts this round.`
        : roundNumber === 1
          ? `Welcome! Each win is ${pts} pts.`
          : `This round is ${pts} pts.`;

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogContent
        className="sm:max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 via-fuchsia-500/20 to-amber-500/20 backdrop-blur"
        onOpenAutoFocus={(e) => e.preventDefault()}  // keep focus in the page
      >
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-extrabold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 text-center">
          <p className="text-lg">{sub}</p>
          <div className="mt-5">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-amber-400 text-black font-semibold"
            >
              Let’s go
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



