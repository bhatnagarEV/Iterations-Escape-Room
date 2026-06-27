export type LockType =
  | 'while-trace'
  | 'for-trace'
  | 'loop-boundary'
  | 'accumulator'
  | 'counter'
  | 'selection-loop'
  | 'string-traversal'
  | 'string-building'
  | 'nested-loop-count'
  | 'nested-loop-output'
  | 'runtime-analysis'
  | 'find-loop-bug'
  | 'choose-loop-header'
  | 'mixed-iteration-trace'
  | 'final-boss';

export interface AnswerChoice {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface ChallengeTemplate {
  id: string;
  lockType: LockType;
  title: string;
  category: string;
  prompt: string;
  code: string;
  choices: AnswerChoice[];
  explanation: string;
  hints: string[];
}

export interface LockDefinition {
  id: string;
  order: number;
  title: string;
  lockType: LockType;
  bank: ChallengeTemplate[];
}

export interface GeneratedChallenge {
  lockId: string;
  challengeId: string;
  title: string;
  category: string;
  lockType: LockType;
  prompt: string;
  code: string;
  choices: AnswerChoice[];
  explanation: string;
  hints: string[];
}

export interface RoomSession {
  classCode: string;
  studentNames: string[];
  seedText: string;
  seedNumber: number;
  generatedAt: string;
  completedAt?: string;
  locks: GeneratedChallenge[];
  attemptsByLock: Record<string, number>;
  completedLocks: string[];
  failedLocks: string[];
}
