// app/join/[eventId]/page.tsx
'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';

export default function JoinPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/play/${String(eventId)}`;
  }, [eventId]);

  return (
    <main className="min-h-[100dvh] grid place-items-center p-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Scan to Join</h1>
        <p className="mt-1 opacity-80">Open your camera and scan the code below.</p>

        <div className="mt-6 inline-block rounded-3xl bg-white p-4 shadow-2xl shadow-black/30">
          <QRCode value={joinUrl || 'https://example.com'} size={320} />
        </div>

        <div className="mt-4 text-sm sm:text-base break-all opacity-80">{joinUrl}</div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <a href={joinUrl} target="_blank" rel="noreferrer">
            <Button className="bg-emerald-500 text-black">Open on this device</Button>
          </a>
          <a href={`/host/${String(eventId)}`}>
            <Button variant="outline">Open Host Screen</Button>
          </a>
        </div>
      </div>
    </main>
  );
}
