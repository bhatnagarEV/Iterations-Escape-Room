import { iterationsLocks } from '../challenges/iterations';
import type { GeneratedChallenge, RoomSession } from '../types';
import { createSeededRng, hashSeed, normalizeSeedPart } from './rng';
import { ROOM_VERSION } from './roomVersion';

export function buildSeedText(classCode: string, studentNames: string[]): string {
  const normalizedClassCode = normalizeSeedPart(classCode);
  const normalizedNames = studentNames
    .map(normalizeSeedPart)
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second));

  return `${normalizedClassCode}|${normalizedNames.join(',')}`;
}

export function generateRoom(classCode: string, studentNames: string[]): RoomSession {
  const seedText = buildSeedText(classCode, studentNames);
  const seedNumber = hashSeed(seedText);
  const rng = createSeededRng(seedNumber);

  const locks: GeneratedChallenge[] = iterationsLocks
    .sort((first, second) => first.order - second.order)
    .map((lock) => {
      const challenge = rng.pick(lock.bank);
      return {
        lockId: lock.id,
        challengeId: challenge.id,
        title: challenge.title,
        category: challenge.category,
        lockType: challenge.lockType,
        prompt: challenge.prompt,
        code: challenge.code,
        choices: rng.shuffle(challenge.choices),
        explanation: challenge.explanation,
        hints: challenge.hints,
      };
    });

  return {
    roomVersion: ROOM_VERSION,
    classCode: classCode.trim(),
    studentNames: studentNames.map((name) => name.trim()).filter(Boolean),
    seedText,
    seedNumber,
    generatedAt: new Date().toISOString(),
    locks,
    attemptsByLock: Object.fromEntries(locks.map((lock) => [lock.lockId, 0])),
    completedLocks: [],
    failedLocks: [],
  };
}
