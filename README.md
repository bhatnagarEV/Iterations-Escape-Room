# AP CSA Iterations Escape Room

A deterministic escape room web app for AP Computer Science A iteration practice.

This room focuses on CS Awesome 2 lessons 2.7-2.12:

- 2.7 While Loops
- 2.8 For Loops
- 2.9 Implementing Selection and Iteration Algorithms
- 2.10 Implementing String Algorithms
- 2.11 Nested Iteration
- 2.12 Informal Runtime Analysis of Loops

The current bank includes 15 locks with 12 variants per lock, for 180 total challenge variants. The final five locks are designed to be more challenging mixed-skill problems.

## Student Flow

- Students enter a class code and up to three student names.
- The same class code and names generate the same room.
- Different teams receive different selected challenge variants and shuffled answer choices.
- Only one lock is visible at a time.
- Each lock allows two attempts:
  - first attempt correct: 1 point
  - second attempt correct: 0.5 points
  - two incorrect attempts: 0 points, then the next lock opens
- The final screen is screenshot-friendly for submission.

## Teacher Mode

Teacher mode is available by adding `?teacher=iterations-key` to the app URL.

Teachers can enter a class code and student names to regenerate that team's exact room, preview the selected challenges, view answers and explanations, and print the answer key.

## Development

```bash
npm install
npm run dev
```

## Deployment

The app is configured for GitHub Pages at:

```text
/Iterations-Escape-Room/
```

The included GitHub Actions workflow builds the app and deploys the `dist` folder to GitHub Pages.
