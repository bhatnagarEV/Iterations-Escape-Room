export interface SeededRng {
  next: () => number;
  integer: (min: number, max: number) => number;
  pick: <T>(items: T[]) => T;
  shuffle: <T>(items: T[]) => T[];
}

export function hashSeed(seedText: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRng(seedNumber: number): SeededRng {
  let state = seedNumber >>> 0;

  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const integer = (min: number, max: number) => {
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const pick = <T,>(items: T[]) => {
    if (items.length === 0) {
      throw new Error('Cannot pick from an empty list.');
    }

    return items[integer(0, items.length - 1)];
  };

  const shuffle = <T,>(items: T[]) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = integer(0, index);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  };

  return { next, integer, pick, shuffle };
}

export function normalizeSeedPart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
