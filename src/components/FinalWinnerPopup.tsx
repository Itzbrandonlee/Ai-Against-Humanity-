'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PlayerDoc } from '@/types';
import confetti from 'canvas-confetti'

export default function FinalWinnerPopup({
  players,
  openWhen,           // pass gameOver flag
}:{
  players: PlayerDoc[];
  openWhen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const fired = useRef(false);

  // top score(s)
  const { winners, top } = useMemo(() => {
    if (!players?.length) return { winners: [] as PlayerDoc[], top: 0 };
    const sorted = players.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const topScore = sorted[0]?.score ?? 0;
    const ties = sorted.filter(p => (p.score ?? 0) === topScore);
    return { winners: ties, top: topScore };
  }, [players]);

  const title = winners.length > 1 ? '🏆 We have co-champions!' : '🏆 Grand Champion!';
  const names = winners.map(w => w.name).join(' & ');

  // bigger confetti moment
  useEffect(() => {
    let cleanup = false;

    async function boomParty() {
      const mod = await import('canvas-confetti');
      const confetti = (mod as any).default || mod;

      // a short “grand finale”: 6 bursts over ~1.2s
      const bursts = [
        { x: 0.5, y: 0.6, count: 180, spread: 75, vel: 55 },
        { x: 0.2, y: 0.7, count: 120, spread: 75, vel: 55 },
        { x: 0.8, y: 0.7, count: 120, spread: 75, vel: 55 },
        { x: 0.35, y: 0.55, count: 140, spread: 80, vel: 60 },
        { x: 0.65, y: 0.55, count: 140, spread: 80, vel: 60 },
        { x: 0.5, y: 0.45, count: 200, spread: 80, vel: 65 },
      ];

      bursts.forEach((b, i) => {
        setTimeout(() => {
          if (cleanup) return;
          confetti({
            particleCount: b.count,
            spread: b.spread,
            startVelocity: b.vel,
            gravity: 0.9,
            ticks: 220,
            origin: { x: b.x, y: b.y },
          });
        }, i * 200);
      });
    }

    if (openWhen && winners.length) {
      setOpen(true);
      if (!fired.current) {
        fired.current = true;
        boomParty();
      }
    } else {
      fired.current = false;
      setOpen(false);
    }

    return () => { cleanup = true; };
  }, [openWhen, winners.length]);

  if (!openWhen || winners.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/20 to-fuchsia-500/20 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl sm:text-4xl font-extrabold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 text-center">
          <div className="text-3xl sm:text-5xl font-black leading-tight">
            {names}
          </div>
          <p className="mt-2 text-base sm:text-lg opacity-90">
            Final score: <span className="font-bold">{top}</span>
          </p>

          <div className="mt-6">
            <Button onClick={() => setOpen(false)} className="bg-amber-400 text-black font-semibold">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
