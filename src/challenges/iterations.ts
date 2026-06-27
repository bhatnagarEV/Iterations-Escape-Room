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

export const iterationsLocks: LockDefinition[] = [
  {
    id: 'lock-1',
    order: 1,
    title: 'While Loop Trace',
    lockType: 'while-trace',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'while-trace',
        title: 'While Loop Trace',
        category: '2.7 While loops',
        prompt: 'What is printed by this code?',
        code: `int n = 1;

while (n < 8) {
    System.out.print(n + " ");
    n += 2;
}`,
        correct: '1 3 5 7',
        distractors: ['1 3 5 7 9', '3 5 7', '1 2 3 4 5 6 7'],
        explanation: 'The loop prints n before adding 2. The last printed value is 7 because 9 is not less than 8.',
        hints: ['Write the value of n before each iteration.', 'Check the condition before the loop body runs.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'while-trace',
        title: 'While Loop Trace',
        category: '2.7 While loops',
        prompt: 'What is printed by this code?',
        code: `int x = 20;

while (x > 3) {
    x /= 2;
    System.out.print(x + " ");
}`,
        correct: '10 5 2',
        distractors: ['20 10 5', '10 5', '20 10 5 2'],
        explanation: 'The loop divides first, then prints. After printing 2, the condition x > 3 is false.',
        hints: ['The assignment happens before the print statement.', 'Integer division keeps the whole-number quotient.'],
      }),
    ],
  },
  {
    id: 'lock-2',
    order: 2,
    title: 'For Loop Trace',
    lockType: 'for-trace',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'for-trace',
        title: 'For Loop Trace',
        category: '2.8 For loops',
        prompt: 'What is the final value of total?',
        code: `int total = 0;

for (int i = 3; i <= 9; i += 3) {
    total += i;
}`,
        correct: '18',
        distractors: ['12', '15', '21'],
        explanation: 'The loop adds 3, 6, and 9, so total becomes 18.',
        hints: ['List the values of i.', 'The condition includes i = 9 because it uses <=.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'for-trace',
        title: 'For Loop Trace',
        category: '2.8 For loops',
        prompt: 'What is the final value of product?',
        code: `int product = 1;

for (int i = 2; i <= 6; i += 2) {
    product *= i;
}`,
        correct: '48',
        distractors: ['24', '12', '64'],
        explanation: 'The loop multiplies by 2, then 4, then 6. The product is 48.',
        hints: ['Start product at 1, not 0.', 'The loop visits only even values from 2 through 6.'],
      }),
    ],
  },
  {
    id: 'lock-3',
    order: 3,
    title: 'Loop Boundary',
    lockType: 'loop-boundary',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'loop-boundary',
        title: 'Loop Boundary',
        category: '2.8 For loops',
        prompt: 'How many times does the loop body run?',
        code: `for (int i = 1; i < 5; i++) {
    System.out.print(i);
}`,
        correct: '4',
        distractors: ['3', '5', '6'],
        explanation: 'The loop runs for i values 1, 2, 3, and 4.',
        hints: ['The condition is i < 5, not i <= 5.', 'Count the valid values of i.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'loop-boundary',
        title: 'Loop Boundary',
        category: '2.7 While loops',
        prompt: 'How many times does the loop body run?',
        code: `int x = 4;
int count = 0;

while (x <= 12) {
    count++;
    x += 4;
}`,
        correct: '3',
        distractors: ['2', '4', '5'],
        explanation: 'The loop runs when x is 4, 8, and 12. Then x becomes 16 and the loop stops.',
        hints: ['Track x at the start of each iteration.', 'The value 12 is included because the condition uses <=.'],
      }),
    ],
  },
  {
    id: 'lock-4',
    order: 4,
    title: 'Accumulator Algorithms',
    lockType: 'accumulator',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'accumulator',
        title: 'Accumulator Algorithms',
        category: '2.9 Loop algorithms',
        prompt: 'What is the final value of sum?',
        code: `int sum = 0;

for (int i = 1; i <= 7; i += 2) {
    sum += i;
}`,
        correct: '16',
        distractors: ['15', '21', '28'],
        explanation: 'The loop adds 1 + 3 + 5 + 7, which equals 16.',
        hints: ['This is an accumulator pattern.', 'List the values added to sum.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'accumulator',
        title: 'Accumulator Algorithms',
        category: '2.9 Loop algorithms',
        prompt: 'What is the final value of total?',
        code: `int total = 0;

for (int i = 2; i <= 5; i++) {
    total += i * i;
}`,
        correct: '54',
        distractors: ['36', '44', '55'],
        explanation: 'The loop adds 4 + 9 + 16 + 25, which equals 54.',
        hints: ['Square i before adding.', 'The loop includes i values 2, 3, 4, and 5.'],
      }),
    ],
  },
  {
    id: 'lock-5',
    order: 5,
    title: 'Counter Algorithms',
    lockType: 'counter',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'counter',
        title: 'Counter Algorithms',
        category: '2.9 Loop algorithms',
        prompt: 'What is the final value of count?',
        code: `int count = 0;

for (int i = 1; i <= 12; i++) {
    if (i % 3 == 0) {
        count++;
    }
}`,
        correct: '4',
        distractors: ['3', '5', '6'],
        explanation: 'The multiples of 3 from 1 through 12 are 3, 6, 9, and 12.',
        hints: ['The counter changes only inside the if statement.', 'Find the multiples of 3 in the loop range.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'counter',
        title: 'Counter Algorithms',
        category: '2.10 String algorithms',
        prompt: 'What is the final value of count?',
        code: `String word = "banana";
int count = 0;

for (int i = 0; i < word.length(); i++) {
    if (word.substring(i, i + 1).equals("a")) {
        count++;
    }
}`,
        correct: '3',
        distractors: ['2', '4', '6'],
        explanation: 'The string banana contains three a characters.',
        hints: ['substring(i, i + 1) gets one character as a string.', 'Count only the letters equal to "a".'],
      }),
    ],
  },
  {
    id: 'lock-6',
    order: 6,
    title: 'Selection With Loops',
    lockType: 'selection-loop',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'selection-loop',
        title: 'Selection With Loops',
        category: '2.9 Loop algorithms',
        prompt: 'What is the final value of max?',
        code: `int number = 2846;
int max = 0;

while (number > 0) {
    int digit = number % 10;
    if (digit > max) {
        max = digit;
    }
    number /= 10;
}`,
        correct: '8',
        distractors: ['2', '4', '6'],
        explanation: 'The loop checks digits 6, 4, 8, and 2. The largest digit is 8.',
        hints: ['number % 10 gives the rightmost digit.', 'number /= 10 removes the rightmost digit.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'selection-loop',
        title: 'Selection With Loops',
        category: '2.9 Loop algorithms',
        prompt: 'What is the final value of count?',
        code: `int limit = 5;
int count = 0;

for (int value = 2; value <= 10; value += 2) {
    if (value > limit) {
        count++;
    }
}`,
        correct: '3',
        distractors: ['2', '4', '5'],
        explanation: 'The values are 2, 4, 6, 8, and 10. Three of them are greater than 5.',
        hints: ['List the values visited by value.', 'Only count values that satisfy value > limit.'],
      }),
    ],
  },
  {
    id: 'lock-7',
    order: 7,
    title: 'String Traversal',
    lockType: 'string-traversal',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'string-traversal',
        title: 'String Traversal',
        category: '2.10 String algorithms',
        prompt: 'What is printed by this code?',
        code: `String word = "paper";

for (int i = 0; i < word.length(); i += 2) {
    System.out.print(word.substring(i, i + 1));
}`,
        correct: 'ppr',
        distractors: ['ape', 'per', 'pap'],
        explanation: 'The loop prints the characters at indexes 0, 2, and 4.',
        hints: ['String indexes start at 0.', 'The loop increases i by 2 each time.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'string-traversal',
        title: 'String Traversal',
        category: '2.10 String algorithms',
        prompt: 'What is printed by this code?',
        code: `String word = "trace";

for (int i = 1; i < word.length(); i += 2) {
    System.out.print(word.substring(i, i + 1));
}`,
        correct: 'rc',
        distractors: ['tae', 'rae', 'tr'],
        explanation: 'The loop prints characters at indexes 1 and 3, which are r and c.',
        hints: ['The first printed index is 1.', 'Stop before i reaches word.length().'],
      }),
    ],
  },
  {
    id: 'lock-8',
    order: 8,
    title: 'String Building',
    lockType: 'string-building',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'string-building',
        title: 'String Building',
        category: '2.10 String algorithms',
        prompt: 'What is the final value of result?',
        code: `String word = "code";
String result = "";

for (int i = word.length() - 1; i >= 0; i--) {
    result += word.substring(i, i + 1);
}`,
        correct: 'edoc',
        distractors: ['code', 'edo', 'doc'],
        explanation: 'The loop starts at the last index and builds the string in reverse order.',
        hints: ['word.length() - 1 is the last valid index.', 'Each new character is added to the end of result.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'string-building',
        title: 'String Building',
        category: '2.10 String algorithms',
        prompt: 'What is the final value of result?',
        code: `String phrase = "a b c";
String result = "";

for (int i = 0; i < phrase.length(); i++) {
    String ch = phrase.substring(i, i + 1);
    if (!ch.equals(" ")) {
        result += ch;
    }
}`,
        correct: 'abc',
        distractors: ['a b c', 'bc', 'ab c'],
        explanation: 'The loop copies every non-space character into result.',
        hints: ['The if statement skips spaces.', 'result grows only when ch is not a space.'],
      }),
    ],
  },
  {
    id: 'lock-9',
    order: 9,
    title: 'Nested Loop Count',
    lockType: 'nested-loop-count',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'nested-loop-count',
        title: 'Nested Loop Count',
        category: '2.11 Nested iteration',
        prompt: 'What is the final value of count?',
        code: `int count = 0;

for (int row = 1; row <= 3; row++) {
    for (int col = 1; col <= 4; col++) {
        count++;
    }
}`,
        correct: '12',
        distractors: ['7', '9', '16'],
        explanation: 'The outer loop runs 3 times and the inner loop runs 4 times each, for 12 total iterations.',
        hints: ['Multiply outer iterations by inner iterations.', 'The inner loop restarts for each row.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'nested-loop-count',
        title: 'Nested Loop Count',
        category: '2.11 Nested iteration',
        prompt: 'What is the final value of count?',
        code: `int count = 0;

for (int row = 1; row <= 4; row++) {
    for (int col = 1; col <= row; col++) {
        count++;
    }
}`,
        correct: '10',
        distractors: ['8', '12', '16'],
        explanation: 'The inner loop runs 1 + 2 + 3 + 4 times, which equals 10.',
        hints: ['The inner loop limit depends on row.', 'Add the number of columns for each row.'],
      }),
    ],
  },
  {
    id: 'lock-10',
    order: 10,
    title: 'Nested Loop Output',
    lockType: 'nested-loop-output',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'nested-loop-output',
        title: 'Nested Loop Output',
        category: '2.11 Nested iteration',
        prompt: 'What is printed by this code?',
        code: `for (int row = 1; row <= 3; row++) {
    for (int col = 1; col <= row; col++) {
        System.out.print(row);
    }
}`,
        correct: '122333',
        distractors: ['123123', '112233', '123'],
        explanation: 'Row 1 prints once, row 2 prints twice, and row 3 prints three times.',
        hints: ['The inner loop count changes with row.', 'The printed value is row, not col.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'nested-loop-output',
        title: 'Nested Loop Output',
        category: '2.11 Nested iteration',
        prompt: 'What is printed by this code?',
        code: `for (int row = 3; row >= 1; row--) {
    for (int col = 1; col <= row; col++) {
        System.out.print("*");
    }
    System.out.print("/");
}`,
        correct: '***/**/*/',
        distractors: ['*/**/***/', '******/', '***/*/**/'],
        explanation: 'The rows print 3 stars, then 2 stars, then 1 star, with a slash after each row.',
        hints: ['The outer loop counts down.', 'The slash prints after each inner loop finishes.'],
      }),
    ],
  },
  {
    id: 'lock-11',
    order: 11,
    title: 'Runtime Analysis',
    lockType: 'runtime-analysis',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'runtime-analysis',
        title: 'Runtime Analysis',
        category: '2.12 Loop analysis',
        prompt: 'In terms of n, how many times does count++ execute?',
        code: `int count = 0;

for (int i = 1; i <= n; i++) {
    count++;
}`,
        correct: 'n',
        distractors: ['n - 1', 'n + 1', '2n'],
        explanation: 'The loop runs once for each integer from 1 through n.',
        hints: ['This is a single loop.', 'The condition includes i = n.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'runtime-analysis',
        title: 'Runtime Analysis',
        category: '2.12 Loop analysis',
        prompt: 'In terms of n and m, how many times does count++ execute?',
        code: `int count = 0;

for (int row = 1; row <= n; row++) {
    for (int col = 1; col <= m; col++) {
        count++;
    }
}`,
        correct: 'n * m',
        distractors: ['n + m', 'n - m', '2 * n * m'],
        explanation: 'For each of n rows, the inner loop runs m times.',
        hints: ['Nested loops with fixed ranges multiply.', 'The inner loop runs fully for every row.'],
      }),
    ],
  },
  {
    id: 'lock-12',
    order: 12,
    title: 'Find the Loop Bug',
    lockType: 'find-loop-bug',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'find-loop-bug',
        title: 'Find the Loop Bug',
        category: 'Debugging loops',
        prompt: 'Which change best fixes the loop so it stops after printing values below 10?',
        code: `int x = 0;

while (x != 10) {
    System.out.print(x + " ");
    x += 3;
}`,
        correct: 'Change x != 10 to x < 10',
        distractors: ['Change x += 3 to x -= 3', 'Change x != 10 to x == 10', 'Move x += 3 before the loop'],
        explanation: 'The values 0, 3, 6, 9, 12 skip over 10, so x != 10 never becomes false.',
        hints: ['Look for a value x may never equal.', 'A boundary condition is safer than checking exact equality here.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'find-loop-bug',
        title: 'Find the Loop Bug',
        category: 'Debugging loops',
        prompt: 'Which change makes the loop print 1 through 5?',
        code: `for (int i = 1; i > 5; i++) {
    System.out.print(i + " ");
}`,
        correct: 'Change i > 5 to i <= 5',
        distractors: ['Change i++ to i--', 'Change int i = 1 to int i = 5', 'Change System.out.print to System.out.println'],
        explanation: 'The original condition is false before the first iteration, so the body never runs.',
        hints: ['Check the condition before the first iteration.', 'Starting at 1, the loop needs to continue while i is at most 5.'],
      }),
    ],
  },
  {
    id: 'lock-13',
    order: 13,
    title: 'Choose the Loop Header',
    lockType: 'choose-loop-header',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'choose-loop-header',
        title: 'Choose the Loop Header',
        category: '2.8 For loops',
        prompt: 'Which loop header correctly adds the even numbers from 2 through 10?',
        code: `int sum = 0;

// choose the loop header
{
    sum += i;
}`,
        correct: 'for (int i = 2; i <= 10; i += 2)',
        distractors: ['for (int i = 2; i < 10; i += 2)', 'for (int i = 1; i <= 10; i += 2)', 'for (int i = 10; i >= 2; i++)'],
        explanation: 'The loop must start at 2, include 10, and increase by 2.',
        hints: ['The word through means 10 should be included.', 'The update should move from one even number to the next.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'choose-loop-header',
        title: 'Choose the Loop Header',
        category: '2.10 String algorithms',
        prompt: 'Which loop header correctly visits every valid index in word?',
        code: `String word = "iteration";

// choose the loop header
{
    System.out.print(word.substring(i, i + 1));
}`,
        correct: 'for (int i = 0; i < word.length(); i++)',
        distractors: ['for (int i = 1; i < word.length(); i++)', 'for (int i = 0; i <= word.length(); i++)', 'for (int i = word.length(); i >= 0; i--)'],
        explanation: 'Valid indexes start at 0 and end at word.length() - 1.',
        hints: ['The first valid string index is 0.', 'Using <= word.length() would go one past the last valid index.'],
      }),
    ],
  },
  {
    id: 'lock-14',
    order: 14,
    title: 'Mixed Iteration Trace',
    lockType: 'mixed-iteration-trace',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'mixed-iteration-trace',
        title: 'Mixed Iteration Trace',
        category: 'Mixed loop trace',
        prompt: 'What is the final value of score?',
        code: `String code = "level";
int score = 0;

for (int i = 0; i < code.length(); i++) {
    String ch = code.substring(i, i + 1);
    if (ch.equals("e")) {
        score += i;
    } else {
        score++;
    }
}`,
        correct: '7',
        distractors: ['5', '6', '8'],
        explanation: 'The loop adds 1 for l, adds index 1 for e, adds 1 for v, adds index 3 for e, then adds 1 for l.',
        hints: ['Track score for each index.', 'When ch is "e", add the index, not 1.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'mixed-iteration-trace',
        title: 'Mixed Iteration Trace',
        category: 'Mixed loop trace',
        prompt: 'What is the final value of sum?',
        code: `int number = 5274;
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
        correct: '-6',
        distractors: ['6', '-4', '18'],
        explanation: 'The digits are processed as 4, 7, 2, 5. Even digits are added and odd digits are subtracted.',
        hints: ['The rightmost digit is processed first.', 'Use number /= 10 to move to the next digit.'],
      }),
    ],
  },
  {
    id: 'lock-15',
    order: 15,
    title: 'Final Boss',
    lockType: 'final-boss',
    bank: [
      makeChallenge({
        id: 1,
        lockType: 'final-boss',
        title: 'Final Boss',
        category: 'Final mixed challenge',
        prompt: 'What is the final value of result?',
        code: `String text = "robot";
int result = 0;

for (int i = 0; i < text.length(); i++) {
    String ch = text.substring(i, i + 1);
    if (ch.equals("o")) {
        result += i;
    } else if (i % 2 == 0) {
        result += 2;
    } else {
        result--;
    }
}`,
        correct: '10',
        distractors: ['8', '9', '12'],
        explanation: 'The updates are +2, +1, +2, +3, and +2, for a final result of 10.',
        hints: ['Trace one index at a time.', 'The o branch runs before the even-index branch is checked.'],
      }),
      makeChallenge({
        id: 2,
        lockType: 'final-boss',
        title: 'Final Boss',
        category: 'Final mixed challenge',
        prompt: 'What is the final value of result?',
        code: `int result = 0;

for (int row = 1; row <= 4; row++) {
    for (int col = 1; col <= row; col++) {
        if ((row + col) % 2 == 0) {
            result += row;
        } else {
            result -= col;
        }
    }
}`,
        correct: '10',
        distractors: ['6', '8', '12'],
        explanation: 'Trace each row carefully. The running result ends at 10 after all nested-loop updates.',
        hints: ['The inner loop length depends on row.', 'Use row + col to decide whether to add or subtract.'],
      }),
    ],
  },
];
