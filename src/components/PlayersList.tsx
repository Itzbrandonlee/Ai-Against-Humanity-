'use client';
import type { PlayerDoc } from '@/types';

export default function PlayersList({ players }: { players: PlayerDoc[] }) {
  return (
    <section className="mt-4">
      <h3 className="text-xs uppercase tracking-wide opacity-70">Players ({players.length})</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {players.map(p => (
          <span
            key={p.id}
            className="rounded-full px-3 py-1 bg-white/6 border border-white/12 text-sm backdrop-blur-sm"
            title={p.id}
          >
            {p.name} <span className="opacity-60">({p.score ?? 0})</span>
          </span>
        ))}
        {players.length === 0 && (
          <span className="opacity-70 text-sm">No players yet</span>
        )}
      </div>
    </section>
  );
}

