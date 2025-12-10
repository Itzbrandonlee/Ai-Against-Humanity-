'use client';

export default function GameHeader({
  eventId,
  status,
  roundIndex,
  roundsTotal,
  isJudge,
}:{
  eventId: string;
  status: 'collecting' | 'judging' | 'reveal' | 'gameOver';
  roundIndex: number;
  roundsTotal: number;
  isJudge?: boolean;
}) {
  const badge =
    status === 'collecting' ? 'bg-amber-400 text-black' :
    status === 'reveal'     ? 'bg-emerald-400 text-black' :
    status === 'gameOver'   ? 'bg-zinc-300 text-black' :
                              'bg-sky-400 text-black';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/play/${eventId}`);
    } catch {}
  };

  return (
    <header className="mb-4">
      <div className="flex items-center gap-3 justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          🎉 AI Against Humanity
        </h1>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold ${badge}`}>
            {status}
          </span>
          <button
            onClick={copy}
            className="px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-xs sm:text-sm hover:bg-white/10"
            title="Copy join link"
          >
            Copy link
          </button>
        </div>
      </div>

      <div className="mt-1 text-sm opacity-80">
        Round <span className="tabular-nums">{roundIndex + 1}</span> / {roundsTotal}
        {isJudge && <span className="ml-2 opacity-70">• Judge</span>}
      </div>

      <hr className="mt-3 border-white/10" />
    </header>
  );
}