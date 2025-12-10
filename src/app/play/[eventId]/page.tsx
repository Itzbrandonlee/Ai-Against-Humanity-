'use client';

import { useParams } from 'next/navigation';
import useAnonAuth from '@/hooks/useAnonAuth';
import useEvent from '@/hooks/useEvent';
import usePlayers from '@/hooks/usePlayers';
import useAnswers from '@/hooks/useAnswers';

import WinnerPopup from '@/components/WinnerPopup';
import RoundStartPopup from '@/components/RoundStartPopup';
import JoinForm from '@/components/JoinForm';
import PlayersList from '@/components/PlayersList';
import JudgeControls from '@/components/JudgeControls';
import PromptCard from '@/components/PromptCard';
import AnswerInput from '@/components/AnswerInput';
import AnonymousAnswers from '@/components/AnonymousAnswers';
import WinnerReveal from '@/components/WinnerReveal';
import GameOver from '@/components/GameOver';
import GameHeader from '@/components/GameHeader';
import JudgeKeyModal from '@/components/JudgeKeyModal';
import useCountdown from '@/hooks/useCountdown';
import { Progress } from '@/components/ui/progress';
import Scoreboard from '@/components/Scoreboard';
import FinalWinnerPopup from '@/components/FinalWinnerPopup';

import { useState, useEffect, useRef } from 'react';

export default function PlayPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { uid, error } = useAnonAuth();
  const { event, isJudge, actions } = useEvent(eventId, uid);
  const { players, playersById, joined, join } = usePlayers(eventId, uid);
  const { answers, submitAnswer, submitted } = useAnswers(eventId, event?.roundIndex, uid);

  const [name, setName] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const { startJudging, enableAiMode } = actions;

  const evId = event?.id ?? '';
  const evStatus = event?.status ?? 'judging';
  const roundIndex = event?.roundIndex ?? 0;
  const roundsTotal = event?.roundsTotal ?? 0;
  const isCollecting = evStatus === 'collecting';
  const isJudging = evStatus === 'judging';
  const isReveal = evStatus === 'reveal';
  const isGameOver = evStatus === 'gameOver' || Boolean(event?.gameOver);
  const canStartCollecting = isJudge && isJudging && answers.length === 0 && !isGameOver;
  const hasTimer = Boolean(event?.collectStartAt && event?.collectDurationSec);

  const { msLeft, secondsLeft, progress /*, isRunning*/ } = useCountdown(
    event?.collectStartAt ?? null,
    event?.collectDurationSec ?? 0,
    Boolean(isCollecting)
  );

  const kickedRef = useRef<string | null>(null);

  // Auto-advance from collecting -> judging when the timer hits 0 (judge only).
  useEffect(() => {
    if (!isJudge) return;
    if (evStatus !== 'collecting') {
      kickedRef.current = null;
      return;
    }
    if (!hasTimer) return;                // wait until server timestamp populates
    if (secondsLeft > 0) return;

    const key = `${evId}:${roundIndex}`;
    if (kickedRef.current === key) return; // one-shot per round
    kickedRef.current = key;

    // schedule microtask to avoid racing the snapshot render
    Promise.resolve().then(() => {
      if (evStatus === 'collecting') startJudging();
    });
  }, [isJudge, evStatus, hasTimer, secondsLeft, evId, roundIndex, startJudging]);

  if (error) return <div className="p-4 text-red-400">Auth error: {error}</div>;
  if (!event) return <div className="p-4">Loading event…</div>;

  return (
    <div className="p-4">
      <GameHeader
        eventId={String(event.id)}
        status={event.status}
        roundIndex={event.roundIndex}
        roundsTotal={roundsTotal}
        isJudge={isJudge}
      />

      <RoundStartPopup
        roundIndex={roundIndex}
        roundsTotal={roundsTotal}
        status={event.status}
      />

      {!joined && uid && (
        <JoinForm
          name={name}
          setName={setName}
          onJoin={() => {
            join(name);
            localStorage.setItem('quip-name', name);
          }}
        />
      )}

      <PlayersList players={players} />
      <Scoreboard players={players} phase={event.status} compact={false} />

      <JudgeKeyModal
        isJudge={isJudge}
        onClaim={actions.claimJudge}
        onLeave={actions.leaveJudge}
      />

      {isJudge && event && (
        <div className="mb-4">
          {!event.aiEnabled && (
            <button 
            type="button"
            onClick={enableAiMode}
            className="px-3 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold">
              Enable AI Player Mode
            </button>
          )}

          {event.aiEnabled && (
            <div className="text-xs text-purple-300 mt-1">
              AI Player Mode Enabled ({event.aiPlayerName ?? 'AI Player'})
            </div>
          )}
          </div>
      )}

      <JudgeControls
        show={isJudge && !isGameOver}
        isCollecting={isCollecting}
        isJudging={isJudging}
        canStartCollecting={canStartCollecting}
        startCollecting={() => actions.startCollecting()}
        startJudging={startJudging}
      />

      {isCollecting && !isGameOver && (
        <>
          <PromptCard
            prompt={event.prompt}
            roundIndex={roundIndex}
            totalRounds={roundsTotal}
          />

          {/* Timer UI */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm opacity-80 mb-1">
              <span>Time left</span>
              <span className="tabular-nums">
                {String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0')}:
                {String((secondsLeft ?? 0) % 60).padStart(2, '0')}
              </span>
            </div>
            <Progress value={progress * 100} className="h-2" />
          </div>

          {/* Players only — judge cannot submit; disable when time is up */}
          {!isJudge && (
            <AnswerInput
              value={myAnswer}
              onChange={setMyAnswer}
              onSubmit={() => {
                submitAnswer(myAnswer, event.status);
                setMyAnswer('');
              }}
              submitted={submitted}
              disabled={!joined || msLeft === 0}
            />
          )}
        </>
      )}

      {event.status === 'judging' && !isGameOver && (
        <section className="mt-4">
          <PromptCard
            prompt={event.prompt}
            roundIndex={roundIndex}
            totalRounds={roundsTotal}
          />
          <AnonymousAnswers
            answers={answers}
            canPick={isJudge}
            onPick={(pid) => actions.pickWinner(pid)}
          />
        </section>
      )}

      {isReveal && !isGameOver && (
        <>
          <WinnerPopup
            winnerId={event.winnerId}
            playersById={playersById}
            answers={answers}
          />
          <WinnerReveal
            winnerId={event.winnerId}
            answers={answers}
            playersById={playersById}
            onNext={actions.nextRound}
            showNext={isJudge}
          />
        </>
      )}

      {isGameOver && (
        <>
          <FinalWinnerPopup players={players} openWhen={true} />
          <GameOver
            players={players}
            isJudge={isJudge}
            onPlayAgain={actions.playAgain}
          />
        </>
      )}
    </div>
  );
}
