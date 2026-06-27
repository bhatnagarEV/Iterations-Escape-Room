import { CheckCircle2, KeyRound, LockKeyhole, Play, Printer, RotateCcw, ShieldCheck, UsersRound, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { generateRoom } from './escape-room/roomEngine';
import { hashSeed } from './escape-room/rng';
import { clearSavedRoom, loadSavedRoom, saveRoom } from './escape-room/storage';
import type { RoomSession } from './types';

const defaultNames = ['', '', ''];
const maxAttemptsPerLock = 2;

type Feedback = {
  lockId: string;
  kind: 'correct' | 'incorrect' | 'failed';
  message: string;
} | null;

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatElapsedTime(startIso: string, endIso: string): string {
  const elapsedSeconds = Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes} min ${seconds.toString().padStart(2, '0')} sec`;
  }

  return `${minutes} min ${seconds.toString().padStart(2, '0')} sec`;
}

function buildCompletionCode(room: RoomSession, totalAttempts: number): string {
  const challengeSignature = room.locks.map((lock) => lock.challengeId).join('|');
  const codeNumber = hashSeed(`${room.seedText}|${challengeSignature}|${totalAttempts}|${room.failedLocks.join(',')}`);
  return `CSA-ITER-${codeNumber.toString(16).toUpperCase().slice(0, 6)}`;
}

function getLockScore(room: RoomSession, lockId: string): number {
  if ((room.failedLocks ?? []).includes(lockId)) {
    return 0;
  }

  if (!room.completedLocks.includes(lockId)) {
    return 0;
  }

  return (room.attemptsByLock[lockId] ?? 0) <= 1 ? 1 : 0.5;
}

function formatScore(score: number): string {
  return Number.isInteger(score) ? score.toString() : score.toFixed(1);
}

function App() {
  const [classCode, setClassCode] = useState('Iterations-P4');
  const [studentNames, setStudentNames] = useState(defaultNames);
  const [room, setRoom] = useState<RoomSession | null>(null);
  const [savedRoom, setSavedRoom] = useState<RoomSession | null>(null);
  const [teacherRoom, setTeacherRoom] = useState<RoomSession | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const isTeacherMode = new URLSearchParams(window.location.search).get('teacher') === '1';

  useEffect(() => {
    setSavedRoom(loadSavedRoom());
  }, []);

  const canStart = useMemo(() => {
    return classCode.trim().length > 0 && studentNames.some((name) => name.trim().length > 0);
  }, [classCode, studentNames]);

  const generateTeacherRoom = () => {
    if (!canStart) {
      return;
    }

    setTeacherRoom(generateRoom(classCode, studentNames));
  };

  const startRoom = () => {
    if (!canStart) {
      return;
    }

    const nextRoom = generateRoom(classCode, studentNames);
    saveRoom(nextRoom);
    setRoom(nextRoom);
    setSavedRoom(nextRoom);
    setFeedback(null);
  };

  const resumeRoom = () => {
    if (savedRoom) {
      setRoom(savedRoom);
      setClassCode(savedRoom.classCode);
      setStudentNames([...savedRoom.studentNames, ...defaultNames].slice(0, 3));
      setFeedback(null);
    }
  };

  const resetRoom = () => {
    clearSavedRoom();
    setRoom(null);
    setSavedRoom(null);
    setFeedback(null);
  };

  if (isTeacherMode) {
    return (
      <main className="app-shell teacher-shell">
        <section className="teacher-header" aria-label="Teacher mode">
          <div>
            <p className="eyebrow">Teacher Mode</p>
            <h1>Answer Key</h1>
            <p className="intro">
              Enter the class code and student names for a group to reconstruct that exact seeded room.
              Teacher Mode is intended for previewing, troubleshooting, and printing answer keys.
            </p>
          </div>
          <div className="teacher-actions">
            <button className="secondary-button" type="button" onClick={() => window.print()} disabled={!teacherRoom}>
              <Printer size={18} />
              Print key
            </button>
            <a className="secondary-link" href={window.location.pathname}>
              Student view
            </a>
          </div>
        </section>

        <section className="teacher-controls" aria-label="Generate answer key">
          <label>
            <span>
              <KeyRound size={18} />
              Class code
            </span>
            <input value={classCode} onChange={(event) => setClassCode(event.target.value)} placeholder="Iterations-P4" />
          </label>

          <label>
            <span>
              <UsersRound size={18} />
              Student 1
            </span>
            <input
              value={studentNames[0]}
              onChange={(event) => setStudentNames([event.target.value, studentNames[1], studentNames[2]])}
              placeholder="Alice"
            />
          </label>

          <label>
            <span>
              <UsersRound size={18} />
              Student 2
            </span>
            <input
              value={studentNames[1]}
              onChange={(event) => setStudentNames([studentNames[0], event.target.value, studentNames[2]])}
              placeholder="Bob"
            />
          </label>

          <label>
            <span>
              <UsersRound size={18} />
              Student 3
            </span>
            <input
              value={studentNames[2]}
              onChange={(event) => setStudentNames([studentNames[0], studentNames[1], event.target.value])}
              placeholder="Optional"
            />
          </label>

          <button className="primary-button" type="button" onClick={generateTeacherRoom} disabled={!canStart}>
            <Play size={19} />
            Generate answer key
          </button>
        </section>

        {teacherRoom ? (
          <section className="answer-key-panel" aria-label="Generated answer key">
            <div className="answer-key-summary">
              <div>
                <span>Students</span>
                <strong>{teacherRoom.studentNames.join(' + ')}</strong>
              </div>
              <div>
                <span>Class Code</span>
                <strong>{teacherRoom.classCode}</strong>
              </div>
              <div>
                <span>Room Seed</span>
                <strong>{teacherRoom.seedNumber}</strong>
              </div>
              <div>
                <span>Locks</span>
                <strong>{teacherRoom.locks.length}</strong>
              </div>
            </div>

            <div className="answer-key-list">
              {teacherRoom.locks.map((lock, index) => {
                const correctChoice = lock.choices.find((choice) => choice.isCorrect);

                return (
                  <article className="answer-key-card" key={lock.lockId}>
                    <div className="answer-key-card-header">
                      <div>
                        <p className="lock-type">Lock {index + 1} · {lock.category}</p>
                        <h2>{lock.title}</h2>
                      </div>
                      <span>{lock.challengeId}</span>
                    </div>
                    <p>{lock.prompt}</p>
                    <pre>
                      <code>{lock.code}</code>
                    </pre>
                    <div className="answer-key-detail">
                      <span>Correct Answer</span>
                      <strong>{correctChoice?.label ?? 'Missing answer'}</strong>
                    </div>
                    <div className="answer-key-detail">
                      <span>Explanation</span>
                      <p>{lock.explanation}</p>
                    </div>
                    <div className="answer-key-detail">
                      <span>Hints</span>
                      <p>{lock.hints.join(' ')}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  const answerCurrentLock = (choiceId: string) => {
    if (!room) {
      return;
    }

    const failedLocks = room.failedLocks ?? [];
    const processedLocks = [...room.completedLocks, ...failedLocks];
    const activeLockIndex = processedLocks.length;
    const activeLock = room.locks[activeLockIndex];
    const selectedChoice = activeLock?.choices.find((choice) => choice.id === choiceId);

    if (!activeLock || !selectedChoice) {
      return;
    }

    const nextAttemptsByLock = {
      ...room.attemptsByLock,
      [activeLock.lockId]: (room.attemptsByLock[activeLock.lockId] ?? 0) + 1,
    };

    if (!selectedChoice.isCorrect) {
      const attemptsForLock = nextAttemptsByLock[activeLock.lockId];
      const shouldFailLock = attemptsForLock >= maxAttemptsPerLock;
      const nextFailedLocks = shouldFailLock && !failedLocks.includes(activeLock.lockId)
        ? [...failedLocks, activeLock.lockId]
        : failedLocks;
      const isRoomFinished = room.completedLocks.length + nextFailedLocks.length === room.locks.length;
      const nextRoom = {
        ...room,
        attemptsByLock: nextAttemptsByLock,
        failedLocks: nextFailedLocks,
        completedAt: isRoomFinished ? new Date().toISOString() : room.completedAt,
      };

      saveRoom(nextRoom);
      setRoom(nextRoom);
      setSavedRoom(nextRoom);
      setFeedback({
        lockId: activeLock.lockId,
        kind: shouldFailLock ? 'failed' : 'incorrect',
        message: shouldFailLock
          ? 'Two incorrect attempts. This lock receives 0 points and the next lock is now available.'
          : 'Not quite. You have 1 attempt remaining before this lock receives 0 points.',
      });
      return;
    }

    const nextCompletedLocks = room.completedLocks.includes(activeLock.lockId)
      ? room.completedLocks
      : [...room.completedLocks, activeLock.lockId];

    const nextRoom = {
      ...room,
      attemptsByLock: nextAttemptsByLock,
      completedLocks: nextCompletedLocks,
      failedLocks,
      completedAt: nextCompletedLocks.length + failedLocks.length === room.locks.length ? new Date().toISOString() : room.completedAt,
    };

    saveRoom(nextRoom);
    setRoom(nextRoom);
    setSavedRoom(nextRoom);
    setFeedback({
      lockId: activeLock.lockId,
      kind: 'correct',
      message:
        nextCompletedLocks.length === room.locks.length
          ? 'Final lock opened. The room is complete.'
          : 'Correct. The next lock is now available.',
    });
  };

  if (room) {
    const failedLocks = room.failedLocks ?? [];
    const processedCount = room.completedLocks.length + failedLocks.length;
    const activeLockIndex = processedCount;
    const currentLock = room.locks[activeLockIndex];
    const solvedCount = room.completedLocks.length;
    const failedCount = failedLocks.length;
    const totalAttempts = Object.values(room.attemptsByLock).reduce((sum, attempts) => sum + attempts, 0);
    const earnedPoints = room.locks.reduce((sum, lock) => sum + getLockScore(room, lock.lockId), 0);
    const isComplete = processedCount === room.locks.length;
    const completedAt = room.completedAt ?? new Date().toISOString();
    const completionCode = buildCompletionCode(room, totalAttempts);

    return (
      <main className="app-shell">
        <section className="room-header" aria-label="Active escape room">
          <div>
            <p className="eyebrow">AP CSA Iterations Escape Room</p>
            <h1>{room.classCode}</h1>
            <p className="subtle">
              Team: {room.studentNames.join(' + ')} · Seed #{room.seedNumber}
            </p>
          </div>
          <button className="icon-button" type="button" onClick={resetRoom} aria-label="Reset saved room">
            <RotateCcw size={20} />
          </button>
        </section>

        <section className="control-strip" aria-label="Room status">
          <div>
            <span className="metric-value">{activeLockIndex + (isComplete ? 0 : 1)}</span>
            <span className="metric-label">Current lock</span>
          </div>
          <div>
            <span className="metric-value">{solvedCount}</span>
            <span className="metric-label">Solved</span>
          </div>
          <div>
            <span className="metric-value">{failedCount}</span>
            <span className="metric-label">Zero scores</span>
          </div>
        </section>

        <section className="progress-track" aria-label="Lock progress">
          {room.locks.map((lock, index) => {
            const isSolved = room.completedLocks.includes(lock.lockId);
            const isFailed = failedLocks.includes(lock.lockId);
            const isCurrent = index === activeLockIndex && !isComplete;

            return (
              <div
                className={`progress-step ${isSolved ? 'is-solved' : ''} ${isFailed ? 'is-failed' : ''} ${isCurrent ? 'is-current' : ''}`}
                key={lock.lockId}
                aria-label={`Lock ${index + 1}: ${isSolved ? 'solved' : isFailed ? 'failed' : isCurrent ? 'current' : 'locked'}`}
              >
                {isSolved ? <CheckCircle2 size={18} /> : isFailed ? <XCircle size={18} /> : isCurrent ? <KeyRound size={18} /> : <LockKeyhole size={18} />}
                <span>{index + 1}</span>
              </div>
            );
          })}
        </section>

        {(feedback?.kind === 'correct' || feedback?.kind === 'failed') && !isComplete ? (
          <div className={`feedback ${feedback.kind} unlock-feedback`}>
            {feedback.kind === 'correct' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        {isComplete ? (
          <section className="summary-panel" aria-label="Escape room completion summary">
            <div className="summary-header">
              <div>
                <p className="eyebrow">Room complete</p>
                <h2>AP CSA Iterations Escape Room Summary</h2>
                <p className="summary-instruction">Take a screenshot of this page and submit it for credit.</p>
              </div>
              <div className="completion-code">
                <span>Completion Code</span>
                <strong>{completionCode}</strong>
              </div>
            </div>

            <div className="summary-facts" aria-label="Completion details">
              <div>
                <span>Students</span>
                <strong>{room.studentNames.join(' + ')}</strong>
              </div>
              <div>
                <span>Class Code</span>
                <strong>{room.classCode}</strong>
              </div>
              <div>
                <span>Completed</span>
                <strong>{formatDateTime(completedAt)}</strong>
              </div>
              <div>
                <span>Completion Time</span>
                <strong>{formatElapsedTime(room.generatedAt, completedAt)}</strong>
              </div>
              <div>
                <span>Total Attempts</span>
                <strong>{totalAttempts}</strong>
              </div>
              <div>
                <span>Score</span>
                <strong>{formatScore(earnedPoints)} / {room.locks.length}</strong>
              </div>
              <div>
                <span>Zero Scores</span>
                <strong>{failedCount}</strong>
              </div>
              <div>
                <span>Room Seed</span>
                <strong>{room.seedNumber}</strong>
              </div>
            </div>

            <div className="summary-table-wrap">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Lock</th>
                    <th>Challenge</th>
                    <th>Variant</th>
                    <th>Attempts</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {room.locks.map((lock, index) => {
                    const wasFailed = failedLocks.includes(lock.lockId);
                    const lockScore = getLockScore(room, lock.lockId);
                    return (
                      <tr key={lock.lockId} className={wasFailed ? 'summary-failed-row' : ''}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{lock.title}</strong>
                          <span>{lock.category}</span>
                        </td>
                        <td>{lock.challengeId}</td>
                        <td>{room.attemptsByLock[lock.lockId] ?? 0}</td>
                        <td>{formatScore(lockScore)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : currentLock ? (
          <section className="active-lock" aria-label={`Current challenge: ${currentLock.title}`}>
            <div className="lock-card active-lock-card">
              <div className="lock-number">{activeLockIndex + 1}</div>
              <div>
                <p className="lock-type">{currentLock.category}</p>
                <h2>{currentLock.title}</h2>
                <p className="attempt-note">
                  Attempts: {room.attemptsByLock[currentLock.lockId] ?? 0} / {maxAttemptsPerLock}
                </p>
                <p>{currentLock.prompt}</p>
                <pre>
                  <code>{currentLock.code}</code>
                </pre>
                <div className="answer-grid">
                  {currentLock.choices.map((choice) => (
                    <button type="button" key={`${currentLock.lockId}-${choice.id}`} onClick={() => answerCurrentLock(choice.id)}>
                      {choice.label}
                    </button>
                  ))}
                </div>
                {feedback?.lockId === currentLock.lockId ? (
                  <div className={`feedback ${feedback.kind}`}>
                    {feedback.kind === 'correct' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span>{feedback.message}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  return (
    <main className="app-shell setup-shell">
      <section className="setup-panel" aria-label="Start escape room">
        <div className="brand-mark" aria-hidden="true">
          <ShieldCheck size={34} />
        </div>
        <h1 className="setup-title">AP CSA Iterations Escape Room</h1>
        <p className="intro">
          Enter the class code and team names. The same team and code will always rebuild the same room,
          while other teams receive different selected locks and shuffled answer choices. Each challenge allows
          two attempts: a first-try solve earns 1 point, a second-try solve earns 0.5 points, and two incorrect
          attempts earns 0 points before moving to the next lock.
        </p>

        <div className="form-grid">
          <label>
            <span>
              <KeyRound size={18} />
              Class code
            </span>
            <input value={classCode} onChange={(event) => setClassCode(event.target.value)} placeholder="Iterations-P4" />
          </label>

          <label>
            <span>
              <UsersRound size={18} />
              Student 1
            </span>
            <input
              value={studentNames[0]}
              onChange={(event) => setStudentNames([event.target.value, studentNames[1], studentNames[2]])}
              placeholder="Alice"
            />
          </label>

          <label>
            <span>
              <UsersRound size={18} />
              Student 2
            </span>
            <input
              value={studentNames[1]}
              onChange={(event) => setStudentNames([studentNames[0], event.target.value, studentNames[2]])}
              placeholder="Bob"
            />
          </label>

          <label>
            <span>
              <UsersRound size={18} />
              Student 3
            </span>
            <input
              value={studentNames[2]}
              onChange={(event) => setStudentNames([studentNames[0], studentNames[1], event.target.value])}
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="action-row">
          <button className="primary-button" type="button" onClick={startRoom} disabled={!canStart}>
            <Play size={19} />
            Generate room
          </button>
          {savedRoom ? (
            <button className="secondary-button" type="button" onClick={resumeRoom}>
              Resume saved room
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default App;
