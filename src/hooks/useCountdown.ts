'use client';
import { useEffect, useState } from 'react';
import type { Timestamp } from 'firebase/firestore';

export default function useCountdown(
  startAt?: Timestamp | null,
  durationSec?: number,
  active: boolean = true,
  tickMs = 250
) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!active || !startAt || !durationSec) return;
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [startAt, durationSec, active, tickMs]);

  const startMs =
    (startAt && typeof (startAt as any).toMillis === 'function')
      ? (startAt as Timestamp).toMillis()
      : 0;

  const durMs = Math.max(0, (durationSec ?? 0) * 1000);
  const end = startMs + durMs;

  const msLeft = Math.max(0, end - now);
  const secondsLeft = Math.ceil(msLeft / 1000);
  const progress = durMs > 0
    ? Math.min(1, Math.max(0, (now - startMs) / durMs))
    : 0;

  return { msLeft, secondsLeft, progress, isRunning: active && msLeft > 0 && durMs > 0 };
}
