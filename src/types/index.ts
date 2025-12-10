export type EventStatus = 'collecting' | 'judging' | 'reveal' | 'gameOver';

export interface EventDoc {
  id: string;
  status: EventStatus;
  roundIndex: number;
  prompt: string;
  winnerId?: string;
  gameOver?: boolean;
  collectStartAt?: any;
  collectDurationSec?: any;
  usedPromptIndexes?: number[];

  // scoring config
  pointsPerWin: number;
  roundsTotal: number;
  finalRoundMultiplier: number;

  // judge control
  judgeAuthId?: string | null; // UID of current judge
  judgeKey?: string | null;    // optional UX helper only
  aiEnabled?: boolean;
  aiPlayerId?: string | null;
  aiPlayerName?: string | null;
}

export interface PlayerDoc {
  id: string;          // auth uid
  name: string;
  score?: number;
  connectedAt: number;
  isAi?: boolean;
}

export interface AnswerDoc {
  id: string;          // == uid (per rules)
  playerId: string;
  text: string;
  createdAt: number;
}


