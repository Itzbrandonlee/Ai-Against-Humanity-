'use client';

import { useParams } from 'next/navigation';
import useAnonAuth from '@/hooks/useAnonAuth';
import useEvent from '@/hooks/useEvent';
import usePlayers from '@/hooks/usePlayers';
import useAnswers from '@/hooks/useAnswers';
import useCountdown from '@/hooks/useCountdown';
import { Progress } from '@/components/ui/progress';

export default function HostPage() {
  const { eventId } = useParams<{ eventId: string }>();

  // ✅ Always call hooks — never inside conditionals/returns
  const { uid } = useAnonAuth();
  const { event } = useEvent(eventId, uid);
  const { players } = usePlayers(eventId, uid);

  // derive safe defaults so hooks below can run on first render
  const roundIndex = event?.roundIndex ?? 0;
  const status = event?.status ?? 'judging';

  // ✅ Call useAnswers unconditionally (was the source of the error)
  const { answers } = useAnswers(eventId, roundIndex, uid);

  // countdown always called; inputs can be null/0 safely
  const startAt  = event?.collectStartAt ?? null;
  const duration = event?.collectDurationSec ?? 0;
  const active   = status === 'collecting';
  const { secondsLeft, progress } = useCountdown(startAt, duration, active);

  // ⬇️ Only after hooks: branch the UI
  if (!event) {
    return <div className="p-6">Loading host view…</div>;
  }

  const isCollecting = status === 'collecting';
  const isJudging    = status === 'judging';
  const isReveal     = status === 'reveal';
  const isGameOver   = status === 'gameOver' || Boolean(event.gameOver);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-4">
        <h1 className="text-3xl font-extrabold">📺 Host — {String(event.id)}</h1>
        <div className="text-sm opacity-70">
          Round {roundIndex + 1} / {event.roundsTotal} • Status: <b>{status}</b>
        </div>
        <hr className="mt-3 border-white/10" />
      </header>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-wide opacity-70 mb-2">
          Round {roundIndex + 1} / {event.roundsTotal}
        </div>
        <div className="text-2xl sm:text-3xl font-bold leading-tight">
          {event.prompt || '…'}
        </div>

        {isCollecting && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm opacity-80 mb-1">
              <span>Time left</span>
              <span className="tabular-nums">
                {String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0')}:
                {String((secondsLeft ?? 0) % 60).padStart(2, '0')}
              </span>
            </div>
            <Progress value={(progress ?? 0) * 100} className="h-2" />
          </div>
        )}
      </div>

      {(isJudging || isReveal) && (
        <ul className="mt-4 grid gap-3">
          {answers.map(a => (
            <li key={a.id} className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-xl">
              {a.text}
            </li>
          ))}
          {!answers.length && (
            <li className="opacity-70 text-sm">Waiting for answers…</li>
          )}
        </ul>
      )}

      <section className="mt-6">
        <h3 className="text-xs uppercase tracking-wide opacity-70 mb-2">Scoreboard</h3>
        <div className="flex flex-wrap gap-2">
          {players
            .slice()
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .map(p => (
              <span key={p.id} className="rounded-full px-3 py-1 bg-white/6 border border-white/12">
                {p.name} <span className="opacity-60">({p.score ?? 0})</span>
              </span>
            ))}
          {!players.length && <span className="opacity-70 text-sm">No players yet</span>}
        </div>
      </section>

      {isGameOver && (
        <div className="mt-8 text-center opacity-80">Game over — start a new one from the judge screen.</div>
      )}
    </div>
  );
}
