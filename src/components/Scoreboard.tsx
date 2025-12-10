'use client';
import type { PlayerDoc } from '@/types';

type Props = {
  players: PlayerDoc[];
  phase: 'collecting' | 'judging' | 'reveal' | 'gameOver';
  compact?: boolean; // set true if you want a smaller list during collecting
};

export default function Scoreboard({ players, phase, compact }: Props) {
  // sort by score desc, then name
  const sorted = players
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name));

  // figure out top score for highlighting ties
  const top = sorted.length ? (sorted[0].score ?? 0) : 0;

  const title =
    phase === 'collecting' ? 'Scoreboard' :
    phase === 'judging'    ? 'Scoreboard (live)' :
    phase === 'reveal'     ? 'Round Results' :
    'Final Standings';

  return (
    <section className={`mt-4 ${compact ? '' : ''}`}>
      <h3 className="text-sm uppercase tracking-wide opacity-70">{title}</h3>
      <ul className={`mt-2 rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden`}>
        {sorted.map((p, idx) => {
          const isLeader = (p.score ?? 0) === top && top > 0;
          return (
            <li
              key={p.id}
              className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-b-0"
            >
              <span className="w-6 text-right tabular-nums opacity-70">{idx + 1}</span>
              <span className={`flex-1 truncate ${isLeader ? 'font-semibold' : ''}`}>
                {p.name}
              </span>
              <span className="tabular-nums">
                {(p.score ?? 0).toString()}
                {isLeader ? ' 👑' : ''}
              </span>
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li className="px-3 py-2 opacity-70">No players yet</li>
        )}
      </ul>
    </section>
  );
}
