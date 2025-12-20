// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const EVENT_ID = 'ai-project'; 

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-[80dvh] grid place-items-center p-6">
      <div className="w-full max-w-xl text-center rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold">AI Against Humanity</h1>
        <p className="mt-2 opacity-80">When you’re ready, show the QR so everyone can join.</p>

        <div className="mt-6">
          <Button
            size="lg"
            className="bg-sky-400 text-black font-bold"
            onClick={() => router.push(`/join/${EVENT_ID}`)}
          >
            Start — Show QR
          </Button>
        </div>
      </div>
    </main>
  );
}
