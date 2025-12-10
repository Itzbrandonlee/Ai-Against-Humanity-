'use client';
export default function JudgeToggle({
  isJudge, judgeKey, setJudgeKey, onClaim, onLeave,
}:{
  isJudge: boolean;
  judgeKey: string;
  setJudgeKey: (s: string) => void;
  onClaim: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="mt-6 border border-zinc-800 rounded p-3 space-y-2">
      <h3 className="font-semibold">Judge</h3>
      {!isJudge ? (
        <div className="flex gap-2">
          <input
            className="flex-1 bg-zinc-800 text-neutral-100 rounded px-3 py-2"
            placeholder="Enter Judge Key"
            value={judgeKey}
            onChange={(e) => setJudgeKey(e.target.value)}
          />
          <button onClick={onClaim} className="bg-amber-400 text-black px-3 py-2 rounded">
            Enter Judge Mode
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">✅ Judge mode is ON</span>
          <button onClick={onLeave} className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded">
            Switch to Player Mode
          </button>
        </div>
      )}
    </div>
  );
}

