'use client';

export default function AnswerInput({
  value, onChange, onSubmit, submitted, disabled
}:{
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitted?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={submitted ? 'Submitted ✔' : 'Type your funniest answer…'}
        disabled={disabled || submitted}
        className="flex-1 bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-base placeholder:text-zinc-500 disabled:opacity-60"
        maxLength={140}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || submitted || !value.trim()}
        className="px-4 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:opacity-90 disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}