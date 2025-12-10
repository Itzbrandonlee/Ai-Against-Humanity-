'use client';
import type { AnswerDoc } from '@/types';

export default function AnonymousAnswers({
  answers,
  canPick,
  onPick,
}:{
  answers: AnswerDoc[];
  canPick: boolean;
  onPick: (playerId: string) => void;
}) {
  if (!answers.length) return <div className="mt-2 text-sm opacity-70">Waiting for answers…</div>;

  return (
    <div className="mt-3 grid gap-2">
      {answers.map(a => (
        <button
          key={a.id}
          disabled={!canPick}
          onClick={() => canPick && onPick(a.playerId)}
          className="text-left rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-lg sm:text-xl break-words hover:bg-white/[0.08] transition-colors disabled:cursor-default"
        >
          {a.text}
        </button>
      ))}
    </div>
  );
}

