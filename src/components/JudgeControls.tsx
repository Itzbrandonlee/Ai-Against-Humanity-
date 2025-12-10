'use client';
import { useState } from 'react';

export default function JudgeControls({
  show, isCollecting, isJudging, canStartCollecting, startCollecting, startJudging,
}:{
  show: boolean;
  isCollecting: boolean;
  isJudging: boolean;
  canStartCollecting: boolean;
  startCollecting: (prompt: string) => Promise<void> | void;
  startJudging: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  if (!show) return null;

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
      <h3 className="text-xs uppercase tracking-wide opacity-70 mb-2">Judge</h3>

      {canStartCollecting && (
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2">
            Random prompt from your pack
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={async () => { setBusy(true); try {
              await startCollecting("What’s the worst gift for Mark?");
            } finally { setBusy(false); } }}
            className="px-3 py-2 rounded-xl bg-sky-400 text-black font-semibold disabled:opacity-60"
          >
            Start Round
          </button>
        </div>
      )}

      {isCollecting && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => { setBusy(true); try { await startJudging(); } finally { setBusy(false); } }}
          className="mt-2 px-3 py-2 rounded-xl bg-sky-400 text-black font-semibold disabled:opacity-60"
        >
          Start Judging
        </button>
      )}
    </section>
  );
}

