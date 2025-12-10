'use client';

type Props = {
  prompt: string;
  roundIndex: number;
  totalRounds: number;
  status?: 'collecting' | 'judging' | 'reveal' | 'gameOver';
  // optional extra content (e.g., timer UI)
  rightSlot?: React.ReactNode;
};

export default function PromptCard({
  prompt,
  roundIndex,
  totalRounds,
  status = 'judging',
  rightSlot,
}: Props) {
  const theme =
    status === 'collecting'
      ? 'from-amber-400 via-pink-500 to-fuchsia-500'
      : status === 'reveal'
      ? 'from-emerald-400 via-teal-400 to-cyan-400'
      : status === 'gameOver'
      ? 'from-zinc-500 via-zinc-400 to-zinc-300'
      : 'from-sky-400 via-indigo-500 to-violet-500'; // judging (default)

  return (
    <div className={`mt-4 p-[2px] rounded-2xl bg-gradient-to-r ${theme} shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]`}>
      {/* inner card */}
      <div className="rounded-2xl bg-zinc-950/95 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4">
        {/* header row */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs sm:text-sm font-semibold tracking-wide">
            <span className="opacity-80">Round</span>
            <span className="tabular-nums">{roundIndex + 1}</span>
            <span className="opacity-50">/</span>
            <span className="tabular-nums">{totalRounds}</span>
          </span>

          <StatusPill status={status} />

          <div className="ml-auto">{rightSlot}</div>
        </div>

        {/* prompt */}
        <div className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug tracking-tight">
          <span className="align-middle">🎤 </span>
          <span className="align-middle">{prompt || '…'}</span>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Props['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    collecting: { label: 'Collecting', cls: 'bg-amber-400 text-black' },
    judging:    { label: 'Judging',    cls: 'bg-sky-400 text-black' },
    reveal:     { label: 'Reveal',     cls: 'bg-emerald-400 text-black' },
    gameOver:   { label: 'Game Over',  cls: 'bg-zinc-300 text-black' },
  };
  const { label, cls } = map[status ?? 'judging'];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs sm:text-sm font-bold shadow ${cls}`}>
      {label}
    </span>
  );
}

