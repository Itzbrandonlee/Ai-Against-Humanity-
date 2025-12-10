'use client';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { PlayerDoc } from '@/types';

export default function GameOver({
  players, isJudge, onPlayAgain, winnerId,
}:{
  winnerId?: string;
  players: PlayerDoc[];
  isJudge?: boolean;
  onPlayAgain?: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const sorted = players.slice().sort((a,b)=> (b.score ?? 0) - (a.score ?? 0));

  const handle = async () => {
    if (!onPlayAgain) return;
    setBusy(true);
    try { await onPlayAgain(); } finally { setBusy(false); }
  };
  useEffect(() => {
    if (!winnerId) return;
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } }), 250);
  }, );
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">🏁 Game Over</h2>
      <ol className="mt-2 space-y-1">
        {sorted.map(p => (
          <li key={p.id}>{p.name}: <b>{p.score ?? 0}</b></li>
        ))}
      </ol>
      {isJudge && onPlayAgain && (
        <button onClick={handle} disabled={busy} className="mt-4 bg-emerald-500 text-black px-3 py-2 rounded disabled:opacity-50">
          {busy ? 'Starting…' : 'Play again'}
        </button>
      )}
    </div>
  );
}

