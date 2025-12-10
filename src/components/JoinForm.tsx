'use client';
export default function JoinForm({
  name, setName, onJoin,
}: { name: string; setName: (s: string) => void; onJoin: () => void; }) {
  return (
    <div className="mt-4 space-y-2">
      <label className="block text-sm">Nickname</label>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-zinc-800 text-neutral-100 rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Disco Shark"
          maxLength={24}
        />
        <button onClick={onJoin} className="bg-emerald-500 text-black px-4 py-2 rounded font-semibold">
          Join
        </button>
      </div>
    </div>
  );
}

