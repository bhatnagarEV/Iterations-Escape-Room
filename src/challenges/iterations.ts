import type { ChallengeTemplate, LockDefinition, LockType } from '../types';

type ChallengeInput = {
  id: number;
  lockType: LockType;
  title: string;
  category: string;
  prompt: string;
  code: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  hints: [string, string];
};

type LockMeta = {
  lockType: LockType;
  title: string;
  category: string;
};

const makeChallenge = ({
  id,
  lockType,
  title,
  category,
  prompt,
  code,
  correct,
  distractors,
  explanation,
  hints,
}: ChallengeInput): ChallengeTemplate => ({
  id: `${lockType}-${id}`,
  lockType,
  title,
  category,
  prompt,
  code,
  choices: [correct, ...distractors].map((label, index) => ({
    id: String.fromCharCode(97 + index),
    label,
    isCorrect: index === 0,
  })),
  explanation,
  hints,
});

const text = (value: number | string) => String(value);

const joined = (values: Array<number | string>) => values.map(text).join(' ');

const uniqueDistractors = (correct: number | string, candidates: Array<number | string>): [string, string, string] => {
  const correctText = text(correct);
  const fallbackCandidates =
    typeof correct === 'number'
      ? [correct - 2, correct - 1, correct + 1, correct + 2, correct * 2, Math.max(0, correct - 3)]
      : ['Nothing is printed', 'The code does not compile', `${correctText} `, correctText.toUpperCase()];
  const distractors = [...candidates, ...fallbackCandidates]
    .map(text)
    .filter((candidate, index, list) => candidate !== correctText && list.indexOf(candidate) === index)
    .slice(0, 3);

  if (distractors.length < 3) {
    throw new Error(`Not enough distractors for ${correctText}`);
  }

  return [distractors[0], distractors[1], distractors[2]];
};

const range = (start: number, stop: number, step: number, inclusive: boolean) => {
  const values: number[] = [];

  if (step > 0) {
    for (let value = start; inclusive ? value <= stop : value < stop; value += step) {
      values.push(value);
    }
  } else {
    for (let value = start; inclusive ? value >= stop : value > stop; value += step) {
      values.push(value);
    }
  }

  return values;
};

const lock = (id: string, order: number, meta: LockMeta, bank: ChallengeTemplate[]): LockDefinition => ({
  id,
  order,
  title: meta.title,
  lockType: meta.lockType,
  bank,
});

const metas = {
  whileTrace: { lockType: 'while-trace', title: 'While Loop Trace', category: '2.7 While loops' },
  forTrace: { lockType: 'for-trace', title: 'For Loop Trace', category: '2.8 For loops' },
  loopBoundary: { lockType: 'loop-boundary', title: 'Loop Boundary', category: '2.8 For loops' },
  accumulator: { lockType: 'accumulator', title: 'Accumulator Algorithms', category: '2.9 Loop algorithms' },
  counter: { lockType: 'counter', title: 'Counter Algorithms', category: '2.9 Loop algorithms' },
  selectionLoop: { lockType: 'selection-loop', title: 'Selection With Loops', category: '2.9 Loop algorithms' },
  stringTraversal: { lockType: 'string-traversal', title: 'String Traversal', category: '2.10 String algorithms' },
  stringBuilding: { lockType: 'string-building', title: 'String Building', category: '2.10 String algorithms' },
  nestedLoopCount: { lockType: 'nested-loop-count', title: 'Nested Loop Count', category: '2.11 Nested iteration' },
  nestedLoopOutput: { lockType: 'nested-loop-output', title: 'Nested Loop Output', category: '2.11 Nested iteration' },
  runtimeAnalysis: { lockType: 'runtime-analysis', title: 'Runtime Analysis', category: '2.12 Loop analysis' },
  findLoopBug: { lockType: 'find-loop-bug', title: 'Find the Loop Bug', category: 'Debugging loops' },
  chooseLoopHeader: { lockType: 'choose-loop-header', title: 'Choose the Loop Header', category: '2.8 For loops' },
  mixedIterationTrace: { lockType: 'mixed-iteration-trace', title: 'Mixed Iteration Trace', category: 'Mixed loop trace' },
  finalBoss: { lockType: 'final-boss', title: 'Final Boss', category: 'Final mixed challenge' },
} satisfies Record<string, LockMeta>;

const whilePrintThenUpdate = (
  id: number,
  variable: string,
  start: number,
  limit: number,
  step: number,
  inclusive: boolean,
): ChallengeTemplate => {
  const meta = metas.whileTrace;
  const values = range(start, limit, step, inclusive);
  const operator = step > 0 ? (inclusive ? '<=' : '<') : inclusive ? '>=' : '>';
  const update = step > 0 ? `${variable} += ${step};` : `${variable} -= ${Math.abs(step)};`;
  const correct = joined(values);
  const extraValue = values.length > 0 ? values[values.length - 1] + step : start;
  const missingFirst = joined(values.slice(1));
  const missingLast = joined(values.slice(0, -1));

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is printed by this code?',
    code: `int ${variable} = ${start};

while (${variable} ${operator} ${limit}) {
    System.out.print(${variable} + " ");
    ${update}
}`,
    correct,
    distractors: uniqueDistractors(correct, [joined([...values, extraValue]), missingFirst, missingLast, values.length]),
    explanation: `The loop prints ${variable} before changing it. The printed values are ${correct}.`,
    hints: ['Track the variable at the start of each iteration.', 'The condition is checked before the loop body runs.'],
  });
};

const whileUpdateThenPrint = (id: number, variable: string, start: number, limit: number, divisor: number): ChallengeTemplate => {
  const meta = metas.whileTrace;
  const values: number[] = [];

  for (let current = start; current > limit;) {
    current = Math.floor(current / divisor);
    values.push(current);
  }

  const correct = joined(values);

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is printed by this code?',
    code: `int ${variable} = ${start};

while (${variable} > ${limit}) {
    ${variable} /= ${divisor};
    System.out.print(${variable} + " ");
}`,
    correct,
    distractors: uniqueDistractors(correct, [joined([start, ...values.slice(0, -1)]), joined(values.slice(0, -1)), joined([start, ...values]), values[0]]),
    explanation: `The division happens before the print statement, so the printed values are ${correct}.`,
    hints: ['The assignment happens before the print statement.', 'Integer division keeps the whole-number quotient.'],
  });
};

const forSumTrace = (id: number, totalName: string, start: number, stop: number, step: number, inclusive: boolean): ChallengeTemplate => {
  const meta = metas.forTrace;
  const values = range(start, stop, step, inclusive);
  const correct = values.reduce((sum, value) => sum + value, 0);
  const operator = inclusive ? '<=' : '<';

  return makeChallenge({
    id,
    ...meta,
    prompt: `What is the final value of ${totalName}?`,
    code: `int ${totalName} = 0;

for (int i = ${start}; i ${operator} ${stop}; i += ${step}) {
    ${totalName} += i;
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [correct - values[values.length - 1], correct + step, values.length, correct + values[0]]),
    explanation: `The loop adds ${joined(values)}, giving ${correct}.`,
    hints: ['List the values of i first.', 'Then add each visited value to the running total.'],
  });
};

const forProductTrace = (id: number, start: number, stop: number, step: number): ChallengeTemplate => {
  const meta = metas.forTrace;
  const values = range(start, stop, step, true);
  const correct = values.reduce((product, value) => product * value, 1);

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of product?',
    code: `int product = 1;

for (int i = ${start}; i <= ${stop}; i += ${step}) {
    product *= i;
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [correct / values[values.length - 1], correct + step, correct * step, values.length]),
    explanation: `The loop multiplies by ${joined(values)}, giving ${correct}.`,
    hints: ['The accumulator starts at 1 for multiplication.', 'Multiply by each value that i visits.'],
  });
};

const loopBoundaryFor = (id: number, start: number, stop: number, step: number, inclusive: boolean): ChallengeTemplate => {
  const meta = metas.loopBoundary;
  const values = range(start, stop, step, inclusive);
  const operator = step > 0 ? (inclusive ? '<=' : '<') : inclusive ? '>=' : '>';
  const update = step > 0 ? `i += ${step}` : `i -= ${Math.abs(step)}`;

  return makeChallenge({
    id,
    ...meta,
    prompt: 'How many times does the loop body run?',
    code: `for (int i = ${start}; i ${operator} ${stop}; ${update}) {
    System.out.print(i);
}`,
    correct: text(values.length),
    distractors: uniqueDistractors(values.length, [values.length - 1, values.length + 1, Math.abs(stop - start), Math.abs(stop - start) + 1]),
    explanation: `The loop runs for i values ${joined(values)}, so the body runs ${values.length} times.`,
    hints: ['Count the values that satisfy the loop condition.', 'Remember that the condition is checked before each iteration.'],
  });
};

const loopBoundaryWhile = (id: number, start: number, stop: number, step: number, inclusive: boolean): ChallengeTemplate => {
  const meta = metas.loopBoundary;
  const values = range(start, stop, step, inclusive);
  const operator = step > 0 ? (inclusive ? '<=' : '<') : inclusive ? '>=' : '>';
  const update = step > 0 ? `x += ${step};` : `x -= ${Math.abs(step)};`;

  return makeChallenge({
    id,
    ...meta,
    prompt: 'How many times does the loop body run?',
    code: `int x = ${start};
int count = 0;

while (x ${operator} ${stop}) {
    count++;
    ${update}
}`,
    correct: text(values.length),
    distractors: uniqueDistractors(values.length, [values.length - 1, values.length + 1, Math.abs(stop - start), Math.abs(step)]),
    explanation: `The loop runs when x is ${joined(values)}, so count becomes ${values.length}.`,
    hints: ['Track x at the start of each iteration.', 'Only count iterations where the condition is true.'],
  });
};

const accumulatorLinear = (id: number, variable: string, start: number, stop: number, step: number, multiplier = 1, offset = 0): ChallengeTemplate => {
  const meta = metas.accumulator;
  const values = range(start, stop, step, true);
  const added = values.map((value) => value * multiplier + offset);
  const correct = added.reduce((sum, value) => sum + value, 0);
  const expression = multiplier === 1 && offset === 0 ? 'i' : offset === 0 ? `${multiplier} * i` : `${multiplier} * i + ${offset}`;

  return makeChallenge({
    id,
    ...meta,
    prompt: `What is the final value of ${variable}?`,
    code: `int ${variable} = 0;

for (int i = ${start}; i <= ${stop}; i += ${step}) {
    ${variable} += ${expression};
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [correct - added[added.length - 1], correct + added[0], values.reduce((sum, value) => sum + value, 0), correct + step]),
    explanation: `The loop adds ${joined(added)}, giving ${correct}.`,
    hints: ['This is an accumulator pattern.', 'Compute the value added during each iteration.'],
  });
};

const accumulatorSquares = (id: number, start: number, stop: number): ChallengeTemplate => {
  const meta = metas.accumulator;
  const values = range(start, stop, 1, true);
  const added = values.map((value) => value * value);
  const correct = added.reduce((sum, value) => sum + value, 0);

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of total?',
    code: `int total = 0;

for (int i = ${start}; i <= ${stop}; i++) {
    total += i * i;
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [values.reduce((sum, value) => sum + value, 0), correct - added[added.length - 1], correct + stop, correct + added[0]]),
    explanation: `The loop adds ${joined(added)}, giving ${correct}.`,
    hints: ['Square i before adding.', 'Do not just add the values of i.'],
  });
};

const counterModulo = (id: number, start: number, stop: number, divisor: number, remainder = 0): ChallengeTemplate => {
  const meta = metas.counter;
  const values = range(start, stop, 1, true);
  const matches = values.filter((value) => value % divisor === remainder);

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of count?',
    code: `int count = 0;

for (int i = ${start}; i <= ${stop}; i++) {
    if (i % ${divisor} == ${remainder}) {
        count++;
    }
}`,
    correct: text(matches.length),
    distractors: uniqueDistractors(matches.length, [matches.length - 1, matches.length + 1, Math.floor((stop - start + 1) / divisor), values.length]),
    explanation: `The matching values are ${joined(matches)}, so count becomes ${matches.length}.`,
    hints: ['The counter changes only inside the if statement.', 'List the values that make the condition true.'],
  });
};

const counterStringChar = (id: number, word: string, target: string): ChallengeTemplate => {
  const meta = { ...metas.counter, category: '2.10 String algorithms' };
  const letters = word.split('');
  const correct = letters.filter((letter) => letter === target).length;

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of count?',
    code: `String word = "${word}";
int count = 0;

for (int i = 0; i < word.length(); i++) {
    if (word.substring(i, i + 1).equals("${target}")) {
        count++;
    }
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [correct - 1, correct + 1, word.length, word.indexOf(target)]),
    explanation: `The string "${word}" contains ${correct} "${target}" characters.`,
    hints: ['substring(i, i + 1) gets one character as a string.', 'Count only characters equal to the target string.'],
  });
};

const selectionMaxDigit = (id: number, number: number): ChallengeTemplate => {
  const meta = metas.selectionLoop;
  const digits = String(number).split('').map(Number).reverse();
  const correct = Math.max(...digits);

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of max?',
    code: `int number = ${number};
int max = 0;

while (number > 0) {
    int digit = number % 10;
    if (digit > max) {
        max = digit;
    }
    number /= 10;
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [digits[0], digits[digits.length - 1], Math.min(...digits), correct - 1]),
    explanation: `The loop checks digits ${joined(digits)}. The largest digit is ${correct}.`,
    hints: ['number % 10 gives the rightmost digit.', 'The if statement updates max only when the current digit is larger.'],
  });
};

const selectionCountGreater = (id: number, start: number, stop: number, step: number, limit: number): ChallengeTemplate => {
  const meta = metas.selectionLoop;
  const values = range(start, stop, step, true);
  const matches = values.filter((value) => value > limit);

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of count?',
    code: `int limit = ${limit};
int count = 0;

for (int value = ${start}; value <= ${stop}; value += ${step}) {
    if (value > limit) {
        count++;
    }
}`,
    correct: text(matches.length),
    distractors: uniqueDistractors(matches.length, [matches.length - 1, matches.length + 1, values.length, values.filter((value) => value >= limit).length]),
    explanation: `The loop visits ${joined(values)}. The values greater than ${limit} are ${joined(matches)}.`,
    hints: ['List the values visited by value.', 'Only count values that satisfy value > limit.'],
  });
};

const stringTraversalForward = (id: number, word: string, start: number, step: number): ChallengeTemplate => {
  const meta = metas.stringTraversal;
  let correct = '';

  for (let index = start; index < word.length; index += step) {
    correct += word.substring(index, index + 1);
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is printed by this code?',
    code: `String word = "${word}";

for (int i = ${start}; i < word.length(); i += ${step}) {
    System.out.print(word.substring(i, i + 1));
}`,
    correct,
    distractors: uniqueDistractors(correct, [word, word.substring(start), word.split('').reverse().join(''), correct.substring(0, Math.max(1, correct.length - 1))]),
    explanation: `The loop prints characters starting at index ${start} and moving by ${step}, giving ${correct}.`,
    hints: ['String indexes start at 0.', 'The update controls which indexes are visited.'],
  });
};

const stringTraversalBackward = (id: number, word: string, start: number, step: number): ChallengeTemplate => {
  const meta = metas.stringTraversal;
  let correct = '';

  for (let index = start; index >= 0; index -= step) {
    correct += word.substring(index, index + 1);
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is printed by this code?',
    code: `String word = "${word}";

for (int i = ${start}; i >= 0; i -= ${step}) {
    System.out.print(word.substring(i, i + 1));
}`,
    correct,
    distractors: uniqueDistractors(correct, [word, word.split('').reverse().join(''), correct.substring(1), word.substring(0, start + 1)]),
    explanation: `The loop moves backward through the string and prints ${correct}.`,
    hints: ['The first printed index is the starting value.', 'The loop stops when i becomes negative.'],
  });
};

const stringBuildReverse = (id: number, word: string): ChallengeTemplate => {
  const meta = metas.stringBuilding;
  const correct = word.split('').reverse().join('');

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of result?',
    code: `String word = "${word}";
String result = "";

for (int i = word.length() - 1; i >= 0; i--) {
    result += word.substring(i, i + 1);
}`,
    correct,
    distractors: uniqueDistractors(correct, [word, correct.substring(0, correct.length - 1), word.substring(1), correct.substring(1)]),
    explanation: `The loop starts at the last index and builds "${correct}".`,
    hints: ['word.length() - 1 is the last valid index.', 'Each new character is added to the end of result.'],
  });
};

const stringBuildFilter = (id: number, phrase: string, skip: string): ChallengeTemplate => {
  const meta = metas.stringBuilding;
  const correct = phrase.split('').filter((character) => character !== skip).join('');

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of result?',
    code: `String phrase = "${phrase}";
String result = "";

for (int i = 0; i < phrase.length(); i++) {
    String ch = phrase.substring(i, i + 1);
    if (!ch.equals("${skip}")) {
        result += ch;
    }
}`,
    correct,
    distractors: uniqueDistractors(correct, [phrase, phrase.replace(skip, ''), correct.substring(1), correct + skip]),
    explanation: `The loop copies every character except "${skip}", giving "${correct}".`,
    hints: ['The if statement skips one specific character.', 'result changes only when the condition is true.'],
  });
};

const nestedFixedCount = (id: number, rows: number, cols: number): ChallengeTemplate => {
  const meta = metas.nestedLoopCount;
  const correct = rows * cols;

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of count?',
    code: `int count = 0;

for (int row = 1; row <= ${rows}; row++) {
    for (int col = 1; col <= ${cols}; col++) {
        count++;
    }
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [rows + cols, rows * (cols - 1), (rows - 1) * cols, correct + rows]),
    explanation: `The outer loop runs ${rows} times and the inner loop runs ${cols} times each, for ${correct} total iterations.`,
    hints: ['Nested loops with fixed ranges multiply.', 'The inner loop restarts for each outer-loop value.'],
  });
};

const nestedTriangleCount = (id: number, rows: number): ChallengeTemplate => {
  const meta = metas.nestedLoopCount;
  const correct = (rows * (rows + 1)) / 2;

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of count?',
    code: `int count = 0;

for (int row = 1; row <= ${rows}; row++) {
    for (int col = 1; col <= row; col++) {
        count++;
    }
}`,
    correct: text(correct),
    distractors: uniqueDistractors(correct, [rows * rows, correct - rows, correct + rows, rows + rows]),
    explanation: `The inner loop runs 1 + 2 + ... + ${rows} times, which equals ${correct}.`,
    hints: ['The inner loop limit depends on row.', 'Add the number of columns for each row.'],
  });
};

const nestedOutputRows = (id: number, rows: number, printRow: boolean): ChallengeTemplate => {
  const meta = metas.nestedLoopOutput;
  let correct = '';

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= row; col += 1) {
      correct += printRow ? row : col;
    }
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is printed by this code?',
    code: `for (int row = 1; row <= ${rows}; row++) {
    for (int col = 1; col <= row; col++) {
        System.out.print(${printRow ? 'row' : 'col'});
    }
}`,
    correct,
    distractors: uniqueDistractors(correct, [Array.from({ length: rows }, (_, index) => index + 1).join(''), correct.split('').reverse().join(''), correct.substring(0, correct.length - 1), correct + rows]),
    explanation: `The nested loop prints ${correct}.`,
    hints: ['The inner loop count changes with row.', `The printed value is ${printRow ? 'row' : 'col'}.`],
  });
};

const nestedOutputStars = (id: number, startRow: number, separator: string): ChallengeTemplate => {
  const meta = metas.nestedLoopOutput;
  let correct = '';

  for (let row = startRow; row >= 1; row -= 1) {
    correct += '*'.repeat(row) + separator;
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is printed by this code?',
    code: `for (int row = ${startRow}; row >= 1; row--) {
    for (int col = 1; col <= row; col++) {
        System.out.print("*");
    }
    System.out.print("${separator}");
}`,
    correct,
    distractors: uniqueDistractors(correct, ['*'.repeat((startRow * (startRow + 1)) / 2) + separator, correct.split('').reverse().join(''), correct.replace(separator, ''), `${separator}${correct}`]),
    explanation: `The rows print ${startRow} stars down to 1 star, with "${separator}" after each row.`,
    hints: ['The outer loop counts down.', 'The separator prints after each inner loop finishes.'],
  });
};

const runtimeChallenge = (
  id: number,
  prompt: string,
  code: string,
  correct: string,
  distractors: [string, string, string],
  explanation: string,
): ChallengeTemplate =>
  makeChallenge({
    id,
    ...metas.runtimeAnalysis,
    prompt,
    code,
    correct,
    distractors,
    explanation,
    hints: ['Count how many times the innermost statement runs.', 'For nested loops, decide whether the counts add, multiply, or form a sum.'],
  });

const bugChallenge = (
  id: number,
  prompt: string,
  code: string,
  correct: string,
  distractors: [string, string, string],
  explanation: string,
): ChallengeTemplate =>
  makeChallenge({
    id,
    ...metas.findLoopBug,
    prompt,
    code,
    correct,
    distractors,
    explanation,
    hints: ['Check the initialization, condition, and update.', 'Ask whether the loop runs too few, too many, or never stops.'],
  });

const headerChallenge = (
  id: number,
  category: string,
  prompt: string,
  code: string,
  correct: string,
  distractors: [string, string, string],
  explanation: string,
): ChallengeTemplate =>
  makeChallenge({
    id,
    ...metas.chooseLoopHeader,
    category,
    prompt,
    code,
    correct,
    distractors,
    explanation,
    hints: ['Match the starting value, stopping condition, and update.', 'Watch carefully for inclusive and exclusive endpoints.'],
  });

const mixedStringScore = (id: number, word: string, target: string): ChallengeTemplate => {
  const meta = metas.mixedIterationTrace;
  let score = 0;
  const notes: string[] = [];

  for (let index = 0; index < word.length; index += 1) {
    const ch = word.substring(index, index + 1);
    if (ch === target) {
      score += index;
      notes.push(`add index ${index}`);
    } else if (index % 2 === 0) {
      score += 2;
      notes.push('add 2');
    } else {
      score -= 1;
      notes.push('subtract 1');
    }
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of score?',
    code: `String word = "${word}";
int score = 0;

for (int i = 0; i < word.length(); i++) {
    String ch = word.substring(i, i + 1);
    if (ch.equals("${target}")) {
        score += i;
    } else if (i % 2 == 0) {
        score += 2;
    } else {
        score--;
    }
}`,
    correct: text(score),
    distractors: uniqueDistractors(score, [score - 1, score + 1, word.length, score + 2]),
    explanation: `The updates are ${notes.join(', ')}, so score ends at ${score}.`,
    hints: ['Trace one index at a time.', `The "${target}" branch is checked before the even-index branch.`],
  });
};

const mixedDigitScore = (id: number, number: number): ChallengeTemplate => {
  const meta = metas.mixedIterationTrace;
  const digits = String(number).split('').map(Number).reverse();
  let sum = 0;

  for (const digit of digits) {
    if (digit % 2 === 0) {
      sum += digit;
    } else {
      sum -= digit;
    }
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of sum?',
    code: `int number = ${number};
int sum = 0;

while (number > 0) {
    int digit = number % 10;
    if (digit % 2 == 0) {
        sum += digit;
    } else {
        sum -= digit;
    }
    number /= 10;
}`,
    correct: text(sum),
    distractors: uniqueDistractors(sum, [-sum, sum - 2, sum + 2, digits.reduce((total, digit) => total + digit, 0)]),
    explanation: `The digits are processed as ${joined(digits)}. Even digits are added and odd digits are subtracted.`,
    hints: ['The rightmost digit is processed first.', 'Use number /= 10 to move to the next digit.'],
  });
};

const finalStringBoss = (id: number, word: string, target: string): ChallengeTemplate => {
  const meta = metas.finalBoss;
  let result = 0;
  const updates: number[] = [];

  for (let index = 0; index < word.length; index += 1) {
    const ch = word.substring(index, index + 1);
    if (ch === target) {
      result += index;
      updates.push(index);
    } else if (index % 2 === 0) {
      result += 2;
      updates.push(2);
    } else {
      result -= 1;
      updates.push(-1);
    }
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of result?',
    code: `String text = "${word}";
int result = 0;

for (int i = 0; i < text.length(); i++) {
    String ch = text.substring(i, i + 1);
    if (ch.equals("${target}")) {
        result += i;
    } else if (i % 2 == 0) {
        result += 2;
    } else {
        result--;
    }
}`,
    correct: text(result),
    distractors: uniqueDistractors(result, [result - 1, result + 1, result + 2, word.length]),
    explanation: `The updates are ${joined(updates)}, so result ends at ${result}.`,
    hints: ['Trace the loop one index at a time.', 'The target-letter branch runs before the even-index branch is checked.'],
  });
};

const finalNestedBoss = (id: number, rows: number): ChallengeTemplate => {
  const meta = metas.finalBoss;
  let result = 0;

  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= row; col += 1) {
      if ((row + col) % 2 === 0) {
        result += row;
      } else {
        result -= col;
      }
    }
  }

  return makeChallenge({
    id,
    ...meta,
    prompt: 'What is the final value of result?',
    code: `int result = 0;

for (int row = 1; row <= ${rows}; row++) {
    for (int col = 1; col <= row; col++) {
        if ((row + col) % 2 == 0) {
            result += row;
        } else {
            result -= col;
        }
    }
}`,
    correct: text(result),
    distractors: uniqueDistractors(result, [result - rows, result + rows, rows * rows, (rows * (rows + 1)) / 2]),
    explanation: `Tracing each nested-loop update gives a final result of ${result}.`,
    hints: ['The inner loop length depends on row.', 'Use row + col to decide whether to add or subtract.'],
  });
};

export const iterationsLocks: LockDefinition[] = [
  lock('lock-1', 1, metas.whileTrace, [
    whilePrintThenUpdate(1, 'n', 1, 8, 2, false),
    whileUpdateThenPrint(2, 'x', 20, 3, 2),
    whilePrintThenUpdate(3, 'value', 2, 11, 3, false),
    whilePrintThenUpdate(4, 'k', 12, 3, -3, true),
    whilePrintThenUpdate(5, 'score', 5, 17, 4, true),
    whileUpdateThenPrint(6, 'amount', 81, 4, 3),
    whilePrintThenUpdate(7, 'num', 10, 0, -2, false),
    whilePrintThenUpdate(8, 'p', 3, 15, 3, true),
    whileUpdateThenPrint(9, 'count', 64, 5, 2),
    whilePrintThenUpdate(10, 'index', 0, 6, 2, true),
    whilePrintThenUpdate(11, 'temp', 18, 6, -4, false),
    whileUpdateThenPrint(12, 'boxes', 100, 10, 4),
  ]),
  lock('lock-2', 2, metas.forTrace, [
    forSumTrace(1, 'total', 3, 9, 3, true),
    forProductTrace(2, 2, 6, 2),
    forSumTrace(3, 'sum', 1, 8, 2, false),
    forSumTrace(4, 'points', 4, 16, 4, true),
    forProductTrace(5, 1, 5, 2),
    forSumTrace(6, 'total', 5, 15, 5, true),
    forSumTrace(7, 'score', 2, 11, 3, false),
    forProductTrace(8, 3, 7, 2),
    forSumTrace(9, 'answer', 6, 18, 6, true),
    forSumTrace(10, 'total', 0, 10, 2, false),
    forProductTrace(11, 2, 8, 3),
    forSumTrace(12, 'sum', 7, 21, 7, true),
  ]),
  lock('lock-3', 3, metas.loopBoundary, [
    loopBoundaryFor(1, 1, 5, 1, false),
    loopBoundaryWhile(2, 4, 12, 4, true),
    loopBoundaryFor(3, 0, 10, 2, false),
    loopBoundaryFor(4, 2, 14, 3, true),
    loopBoundaryWhile(5, 18, 2, -4, false),
    loopBoundaryFor(6, 9, 0, -3, true),
    loopBoundaryWhile(7, 1, 20, 5, false),
    loopBoundaryFor(8, 5, 5, 1, true),
    loopBoundaryFor(9, 10, 1, -2, false),
    loopBoundaryWhile(10, 3, 15, 3, true),
    loopBoundaryFor(11, 4, 17, 4, false),
    loopBoundaryWhile(12, 30, 6, -6, true),
  ]),
  lock('lock-4', 4, metas.accumulator, [
    accumulatorLinear(1, 'sum', 1, 7, 2),
    accumulatorSquares(2, 2, 5),
    accumulatorLinear(3, 'total', 2, 10, 2),
    accumulatorLinear(4, 'score', 1, 4, 1, 3),
    accumulatorSquares(5, 1, 4),
    accumulatorLinear(6, 'points', 5, 20, 5, 1, 2),
    accumulatorLinear(7, 'sum', 3, 15, 3, 2),
    accumulatorSquares(8, 3, 6),
    accumulatorLinear(9, 'total', 4, 12, 4, 2, 1),
    accumulatorLinear(10, 'answer', 1, 9, 2, 1, 1),
    accumulatorSquares(11, 1, 5),
    accumulatorLinear(12, 'sum', 6, 18, 6, 3),
  ]),
  lock('lock-5', 5, metas.counter, [
    counterModulo(1, 1, 12, 3),
    counterStringChar(2, 'banana', 'a'),
    counterModulo(3, 2, 20, 4),
    counterModulo(4, 1, 15, 2, 1),
    counterStringChar(5, 'mississippi', 's'),
    counterStringChar(6, 'committee', 'e'),
    counterModulo(7, 5, 30, 5),
    counterModulo(8, 0, 18, 3, 1),
    counterStringChar(9, 'abracadabra', 'a'),
    counterStringChar(10, 'iteration', 't'),
    counterModulo(11, 10, 25, 4, 2),
    counterStringChar(12, 'bookkeeper', 'o'),
  ]),
  lock('lock-6', 6, metas.selectionLoop, [
    selectionMaxDigit(1, 2846),
    selectionCountGreater(2, 2, 10, 2, 5),
    selectionMaxDigit(3, 51739),
    selectionCountGreater(4, 3, 21, 3, 12),
    selectionMaxDigit(5, 63042),
    selectionCountGreater(6, 1, 16, 3, 8),
    selectionMaxDigit(7, 90918),
    selectionCountGreater(8, 4, 28, 4, 17),
    selectionMaxDigit(9, 47205),
    selectionCountGreater(10, 6, 30, 6, 18),
    selectionMaxDigit(11, 13579),
    selectionCountGreater(12, 5, 25, 5, 11),
  ]),
  lock('lock-7', 7, metas.stringTraversal, [
    stringTraversalForward(1, 'paper', 0, 2),
    stringTraversalForward(2, 'trace', 1, 2),
    stringTraversalBackward(3, 'loops', 4, 1),
    stringTraversalForward(4, 'iteration', 0, 3),
    stringTraversalBackward(5, 'condition', 8, 2),
    stringTraversalForward(6, 'algorithm', 2, 2),
    stringTraversalForward(7, 'runtime', 1, 3),
    stringTraversalBackward(8, 'nested', 5, 2),
    stringTraversalForward(9, 'computer', 0, 2),
    stringTraversalBackward(10, 'science', 6, 3),
    stringTraversalForward(11, 'selection', 2, 3),
    stringTraversalBackward(12, 'practice', 7, 2),
  ]),
  lock('lock-8', 8, metas.stringBuilding, [
    stringBuildReverse(1, 'code'),
    stringBuildFilter(2, 'a b c', ' '),
    stringBuildReverse(3, 'loop'),
    stringBuildFilter(4, 'mississippi', 's'),
    stringBuildReverse(5, 'trace'),
    stringBuildFilter(6, 'iteration', 'i'),
    stringBuildReverse(7, 'nested'),
    stringBuildFilter(8, 'bookkeeper', 'e'),
    stringBuildReverse(9, 'runtime'),
    stringBuildFilter(10, 'a-a-a', '-'),
    stringBuildReverse(11, 'debug'),
    stringBuildFilter(12, 'computer', 'o'),
  ]),
  lock('lock-9', 9, metas.nestedLoopCount, [
    nestedFixedCount(1, 3, 4),
    nestedTriangleCount(2, 4),
    nestedFixedCount(3, 5, 2),
    nestedTriangleCount(4, 5),
    nestedFixedCount(5, 4, 6),
    nestedTriangleCount(6, 6),
    nestedFixedCount(7, 2, 7),
    nestedTriangleCount(8, 7),
    nestedFixedCount(9, 6, 3),
    nestedTriangleCount(10, 8),
    nestedFixedCount(11, 4, 5),
    nestedTriangleCount(12, 9),
  ]),
  lock('lock-10', 10, metas.nestedLoopOutput, [
    nestedOutputRows(1, 3, true),
    nestedOutputStars(2, 3, '/'),
    nestedOutputRows(3, 4, false),
    nestedOutputRows(4, 4, true),
    nestedOutputStars(5, 4, '|'),
    nestedOutputRows(6, 5, false),
    nestedOutputRows(7, 2, true),
    nestedOutputStars(8, 5, '/'),
    nestedOutputRows(9, 5, true),
    nestedOutputRows(10, 3, false),
    nestedOutputStars(11, 2, '|'),
    nestedOutputStars(12, 6, '/'),
  ]),
  lock('lock-11', 11, metas.runtimeAnalysis, [
    runtimeChallenge(1, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int i = 1; i <= n; i++) {
    count++;
}`, 'n', ['n - 1', 'n + 1', '2n'], 'The loop runs once for each integer from 1 through n.'),
    runtimeChallenge(2, 'In terms of n and m, how many times does count++ execute?', `int count = 0;

for (int row = 1; row <= n; row++) {
    for (int col = 1; col <= m; col++) {
        count++;
    }
}`, 'n * m', ['n + m', 'n - m', '2 * n * m'], 'For each of n rows, the inner loop runs m times.'),
    runtimeChallenge(3, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int i = 0; i < n; i += 2) {
    count++;
}`, 'about n / 2 times', ['n times', '2n times', 'n - 2 times'], 'The loop skips by 2, so it runs about half as many times as a loop that increments by 1.'),
    runtimeChallenge(4, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int row = 1; row <= n; row++) {
    for (int col = 1; col <= row; col++) {
        count++;
    }
}`, 'n * (n + 1) / 2', ['n * n', '2n', 'n + 1'], 'The inner loop runs 1 + 2 + ... + n times.'),
    runtimeChallenge(5, 'In terms of n, how many times does count++ execute?', `int count = 0;

int value = n;
while (value > 0) {
    count++;
    value /= 10;
}`, 'once per digit in n', ['n times', '10 times', 'n / 10 times'], 'Each iteration removes one decimal digit.'),
    runtimeChallenge(6, 'If word has length n, how many times does count++ execute?', `int count = 0;

for (int i = 0; i < word.length(); i++) {
    count++;
}`, 'n', ['n - 1', 'n + 1', '2n'], 'A string with length n has valid indexes 0 through n - 1.'),
    runtimeChallenge(7, 'If word has length n, how many substring calls happen?', `for (int i = 1; i < word.length(); i += 2) {
    System.out.print(word.substring(i, i + 1));
}`, 'about n / 2 calls', ['n calls', '2n calls', 'n - 1 calls'], 'The loop visits every other index starting at 1.'),
    runtimeChallenge(8, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int row = n; row >= 1; row--) {
    for (int col = 1; col <= row; col++) {
        count++;
    }
}`, 'n * (n + 1) / 2', ['n * n', 'n', '2n'], 'Counting down still gives n + (n - 1) + ... + 1 iterations.'),
    runtimeChallenge(9, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int i = 1; i <= n; i++) {
    count++;
}
for (int j = 1; j <= n; j++) {
    count++;
}`, '2n', ['n * n', 'n + 1', 'n / 2'], 'The two separate loops run n times each.'),
    runtimeChallenge(10, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int row = 1; row <= n; row++) {
    for (int col = 1; col <= 3; col++) {
        count++;
    }
}`, '3n', ['n + 3', 'n * n', 'n / 3'], 'For each of n rows, the inner loop runs exactly 3 times.'),
    runtimeChallenge(11, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int i = 1; i <= n; i *= 2) {
    count++;
}`, 'about log2(n) times', ['n times', 'n / 2 times', '2n times'], 'The value doubles each time, so the number of iterations grows very slowly.'),
    runtimeChallenge(12, 'In terms of n, how many times does count++ execute?', `int count = 0;

for (int row = 1; row <= n; row++) {
    count++;
    for (int col = 1; col <= n; col++) {
        count++;
    }
}`, 'n + n * n', ['2n', 'n * n', 'n * n * n'], 'The outer count++ runs n times, and the inner count++ runs n * n times.'),
  ]),
  lock('lock-12', 12, metas.findLoopBug, [
    bugChallenge(1, 'Which change best fixes the loop so it stops after printing values below 10?', `int x = 0;

while (x != 10) {
    System.out.print(x + " ");
    x += 3;
}`, 'Change x != 10 to x < 10', ['Change x += 3 to x -= 3', 'Change x != 10 to x == 10', 'Move x += 3 before the loop'], 'The values 0, 3, 6, 9, 12 skip over 10, so x != 10 never becomes false.'),
    bugChallenge(2, 'Which change makes the loop print 1 through 5?', `for (int i = 1; i > 5; i++) {
    System.out.print(i + " ");
}`, 'Change i > 5 to i <= 5', ['Change i++ to i--', 'Change int i = 1 to int i = 5', 'Change System.out.print to System.out.println'], 'The original condition is false before the first iteration, so the body never runs.'),
    bugChallenge(3, 'Which change prevents an infinite loop?', `int x = 1;

while (x < 20) {
    System.out.print(x + " ");
}`, 'Add x++ inside the loop body', ['Change x < 20 to x > 20', 'Change x = 1 to x = 0', 'Add int x = 20 inside the loop body'], 'x never changes, so x < 20 stays true forever.'),
    bugChallenge(4, 'Which change correctly visits every character in word?', `String word = "loop";

for (int i = 0; i <= word.length(); i++) {
    System.out.print(word.substring(i, i + 1));
}`, 'Change i <= word.length() to i < word.length()', ['Change i++ to i += 2', 'Change i = 0 to i = 1', 'Change substring(i, i + 1) to substring(i, i)'], 'The last valid index is word.length() - 1.'),
    bugChallenge(5, 'Which change makes the loop count down from 5 to 1?', `for (int i = 5; i >= 1; i++) {
    System.out.print(i + " ");
}`, 'Change i++ to i--', ['Change i >= 1 to i <= 1', 'Change i = 5 to i = 1', 'Change System.out.print to System.out.println'], 'The update must move i toward the stopping point.'),
    bugChallenge(6, 'Which change makes result contain the reverse of word?', `String word = "abc";
String result = "";

for (int i = word.length(); i >= 0; i--) {
    result += word.substring(i, i + 1);
}`, 'Start i at word.length() - 1', ['Change i-- to i++', 'Start i at 0', 'Change i >= 0 to i > 0'], 'word.length() is one past the last valid index.'),
    bugChallenge(7, 'Which change makes the loop print only even values from 2 through 10?', `for (int i = 2; i <= 10; i++) {
    System.out.print(i + " ");
}`, 'Change i++ to i += 2', ['Change i <= 10 to i < 10', 'Change i = 2 to i = 1', 'Change i++ to i--'], 'The starting value is even, but the update must skip to the next even value.'),
    bugChallenge(8, 'Which change makes count store the number of multiples of 5?', `int count = 0;

for (int i = 1; i <= 30; i++) {
    if (i / 5 == 0) {
        count++;
    }
}`, 'Change i / 5 == 0 to i % 5 == 0', ['Change count++ to count--', 'Change i <= 30 to i < 30', 'Change i++ to i += 5'], 'The remainder operator checks divisibility.'),
    bugChallenge(9, 'Which change makes the while loop run exactly while number still has digits?', `int number = 472;

while (number >= 0) {
    System.out.print(number % 10);
    number /= 10;
}`, 'Change number >= 0 to number > 0', ['Change number /= 10 to number %= 10', 'Change number % 10 to number / 10', 'Change number = 472 to number = 0'], 'After the digits are removed, number becomes 0 and stays 0.'),
    bugChallenge(10, 'Which change correctly counts the letter a in word?', `String word = "banana";
int count = 0;

for (int i = 0; i < word.length(); i++) {
    if (word.substring(i, i + 1) == "a") {
        count++;
    }
}`, 'Use .equals("a") instead of ==', ['Change i < word.length() to i <= word.length()', 'Change count++ to count += i', 'Use substring(i, i) instead'], 'Strings should be compared with equals.'),
    bugChallenge(11, 'Which change makes the nested loop count all row-column pairs?', `int count = 0;

for (int row = 1; row <= 3; row++) {
    for (int col = 1; col <= 4; row++) {
        count++;
    }
}`, 'Change row++ in the inner loop update to col++', ['Change col <= 4 to col >= 4', 'Change row <= 3 to row < 3', 'Change count++ to count += row'], 'The inner loop should update col, not row.'),
    bugChallenge(12, 'Which change lets this loop find the largest digit correctly?', `int number = 593;
int max = 0;

while (number > 0) {
    int digit = number / 10;
    if (digit > max) {
        max = digit;
    }
    number /= 10;
}`, 'Change number / 10 to number % 10', ['Change max = 0 to max = 10', 'Change number /= 10 to number %= 10', 'Change digit > max to digit < max'], 'number % 10 extracts the rightmost digit.'),
  ]),
  lock('lock-13', 13, metas.chooseLoopHeader, [
    headerChallenge(1, '2.8 For loops', 'Which loop header correctly adds the even numbers from 2 through 10?', `int sum = 0;

// choose the loop header
{
    sum += i;
}`, 'for (int i = 2; i <= 10; i += 2)', ['for (int i = 2; i < 10; i += 2)', 'for (int i = 1; i <= 10; i += 2)', 'for (int i = 10; i >= 2; i++)'], 'The loop must start at 2, include 10, and increase by 2.'),
    headerChallenge(2, '2.10 String algorithms', 'Which loop header correctly visits every valid index in word?', `String word = "iteration";

// choose the loop header
{
    System.out.print(word.substring(i, i + 1));
}`, 'for (int i = 0; i < word.length(); i++)', ['for (int i = 1; i < word.length(); i++)', 'for (int i = 0; i <= word.length(); i++)', 'for (int i = word.length(); i >= 0; i--)'], 'Valid indexes start at 0 and end at word.length() - 1.'),
    headerChallenge(3, '2.8 For loops', 'Which loop header prints 10, 8, 6, 4, 2?', `// choose the loop header
{
    System.out.print(i + " ");
}`, 'for (int i = 10; i >= 2; i -= 2)', ['for (int i = 10; i > 2; i -= 2)', 'for (int i = 2; i <= 10; i += 2)', 'for (int i = 10; i >= 2; i += 2)'], 'The loop counts down by 2 and includes 2.'),
    headerChallenge(4, '2.10 String algorithms', 'Which loop header visits every other index starting with index 1?', `String word = "computer";

// choose the loop header
{
    System.out.print(word.substring(i, i + 1));
}`, 'for (int i = 1; i < word.length(); i += 2)', ['for (int i = 0; i < word.length(); i += 2)', 'for (int i = 1; i <= word.length(); i += 2)', 'for (int i = word.length(); i >= 1; i -= 2)'], 'Start at 1 and increase by 2 while i is still a valid index.'),
    headerChallenge(5, '2.8 For loops', 'Which loop header makes the body run exactly 4 times?', `int count = 0;

// choose the loop header
{
    count++;
}`, 'for (int i = 3; i <= 12; i += 3)', ['for (int i = 3; i < 12; i += 3)', 'for (int i = 0; i <= 12; i += 3)', 'for (int i = 12; i >= 3; i++)'], 'The values 3, 6, 9, and 12 give four iterations.'),
    headerChallenge(6, '2.10 String algorithms', 'Which loop header correctly builds a reversed string?', `String word = "trace";
String result = "";

// choose the loop header
{
    result += word.substring(i, i + 1);
}`, 'for (int i = word.length() - 1; i >= 0; i--)', ['for (int i = word.length(); i >= 0; i--)', 'for (int i = 0; i < word.length(); i++)', 'for (int i = word.length() - 1; i > 0; i--)'], 'The last valid index is word.length() - 1 and index 0 must be included.'),
    headerChallenge(7, '2.8 For loops', 'Which loop header adds multiples of 5 from 5 through 30?', `int sum = 0;

// choose the loop header
{
    sum += i;
}`, 'for (int i = 5; i <= 30; i += 5)', ['for (int i = 5; i < 30; i += 5)', 'for (int i = 0; i <= 30; i += 5)', 'for (int i = 30; i >= 5; i += 5)'], 'The sequence should be 5, 10, 15, 20, 25, 30.'),
    headerChallenge(8, '2.8 For loops', 'Which loop header counts down from 7 to 1?', `// choose the loop header
{
    System.out.print(i);
}`, 'for (int i = 7; i >= 1; i--)', ['for (int i = 7; i > 1; i--)', 'for (int i = 1; i <= 7; i++)', 'for (int i = 7; i >= 1; i++)'], 'The update must decrease i and the condition must include 1.'),
    headerChallenge(9, '2.10 String algorithms', 'Which loop header starts at the second-to-last character and moves left?', `String word = "algorithm";

// choose the loop header
{
    System.out.print(word.substring(i, i + 1));
}`, 'for (int i = word.length() - 2; i >= 0; i--)', ['for (int i = word.length() - 1; i >= 0; i--)', 'for (int i = word.length() - 2; i > 0; i--)', 'for (int i = 1; i < word.length(); i++)'], 'The second-to-last index is word.length() - 2.'),
    headerChallenge(10, '2.8 For loops', 'Which loop header visits 4, 7, 10, and 13?', `// choose the loop header
{
    System.out.print(i + " ");
}`, 'for (int i = 4; i <= 13; i += 3)', ['for (int i = 4; i < 13; i += 3)', 'for (int i = 3; i <= 13; i += 4)', 'for (int i = 13; i >= 4; i += 3)'], 'Start at 4, include 13, and add 3 each time.'),
    headerChallenge(11, '2.10 String algorithms', 'Which loop header checks every possible single-character substring?', `String word = "loops";

// choose the loop header
{
    String ch = word.substring(i, i + 1);
}`, 'for (int i = 0; i < word.length(); i++)', ['for (int i = 0; i <= word.length(); i++)', 'for (int i = 1; i < word.length(); i++)', 'for (int i = 0; i < word.length() - 1; i++)'], 'Every valid single-character start index is 0 through word.length() - 1.'),
    headerChallenge(12, '2.8 For loops', 'Which loop header visits positive powers of 2 up to 32?', `// choose the loop header
{
    System.out.print(i + " ");
}`, 'for (int i = 1; i <= 32; i *= 2)', ['for (int i = 2; i <= 32; i *= 2)', 'for (int i = 1; i < 32; i *= 2)', 'for (int i = 1; i <= 32; i += 2)'], 'Multiplying by 2 visits 1, 2, 4, 8, 16, and 32.'),
  ]),
  lock('lock-14', 14, metas.mixedIterationTrace, [
    mixedStringScore(1, 'level', 'e'),
    mixedDigitScore(2, 5274),
    mixedStringScore(3, 'robot', 'o'),
    mixedDigitScore(4, 9136),
    mixedStringScore(5, 'trace', 't'),
    mixedDigitScore(6, 84251),
    mixedStringScore(7, 'looping', 'o'),
    mixedDigitScore(8, 70528),
    mixedStringScore(9, 'banana', 'a'),
    mixedDigitScore(10, 24613),
    mixedStringScore(11, 'method', 'd'),
    mixedDigitScore(12, 97531),
  ]),
  lock('lock-15', 15, metas.finalBoss, [
    finalStringBoss(1, 'robot', 'o'),
    finalNestedBoss(2, 4),
    finalStringBoss(3, 'iteration', 't'),
    finalNestedBoss(4, 5),
    finalStringBoss(5, 'condition', 'i'),
    finalNestedBoss(6, 6),
    finalStringBoss(7, 'algorithm', 'o'),
    finalNestedBoss(8, 7),
    finalStringBoss(9, 'computer', 'e'),
    finalNestedBoss(10, 8),
    finalStringBoss(11, 'practice', 'c'),
    finalNestedBoss(12, 9),
  ]),
];
