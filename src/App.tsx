/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ExerciseType,
  GameMode,
  WorkoutState,
  RepDetectionResult,
  FloatingNotification,
  RoutineStep,
} from './types/fitness';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { GameModeSelector } from './components/GameModeSelector';
import { ExerciseSelector } from './components/ExerciseSelector';
import { CameraView } from './components/CameraView';
import { WorkoutControls } from './components/WorkoutControls';
import { ExerciseInstructions } from './components/ExerciseInstructions';
import { RoutineProgress } from './components/RoutineProgress';
import { WorkoutSummary } from './components/WorkoutSummary';
import { FloatingFeedback } from './components/FloatingFeedback';
import { ExerciseTrackerManager, EXERCISE_DEFINITIONS } from './utils/poseEngines';
import { soundEffects } from './utils/audio';
import confetti from 'canvas-confetti';

const INITIAL_ROUTINE_STEPS: RoutineStep[] = [
  { exerciseId: 'squats', targetReps: 8, completedReps: 0, isCompleted: false },
  { exerciseId: 'jumps', targetReps: 10, completedReps: 0, isCompleted: false },
  { exerciseId: 'pushups', targetReps: 6, completedReps: 0, isCompleted: false },
  { exerciseId: 'lunges', targetReps: 8, completedReps: 0, isCompleted: false },
  { exerciseId: 'jumping_jacks', targetReps: 12, completedReps: 0, isCompleted: false },
];

export default function App() {
  // Game & Workout States
  const [workoutState, setWorkoutState] = useState<WorkoutState>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('free_play');
  const [currentExercise, setCurrentExercise] = useState<ExerciseType>('squats');

  // Scoring & Stats
  const [score, setScore] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lastRepTime, setLastRepTime] = useState<number>(0);
  const [repsMap, setRepsMap] = useState<Record<ExerciseType, number>>({
    squats: 0,
    jumps: 0,
    pushups: 0,
    lunges: 0,
    jumping_jacks: 0,
  });

  // Timers
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [challengeSecondsLeft, setChallengeSecondsLeft] = useState<number>(30);

  // Routine Mode States
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>(INITIAL_ROUTINE_STEPS);
  const [currentRoutineIndex, setCurrentRoutineIndex] = useState<number>(0);

  // Camera & Model States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Summary & Feedback Modals
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

  // Tracker Engine Instance
  const trackerManager = useMemo(() => new ExerciseTrackerManager(), []);

  // Compute current multiplier (1x < 5 streak, 2x 5-9 streak, 3x 10+ streak)
  const multiplier = useMemo(() => {
    if (currentStreak >= 10) return 3;
    if (currentStreak >= 5) return 2;
    return 1;
  }, [currentStreak]);

  // Compute total completed reps across all exercises
  const totalReps = useMemo(() => {
    return Object.values(repsMap).reduce((acc, curr) => acc + curr, 0);
  }, [repsMap]);

  // Estimated calories burned (~0.4 - 0.7 kcal per rep)
  const estimatedCalories = useMemo(() => {
    const squatCals = (repsMap.squats || 0) * 0.45;
    const jumpCals = (repsMap.jumps || 0) * 0.65;
    const pushupCals = (repsMap.pushups || 0) * 0.55;
    const lungeCals = (repsMap.lunges || 0) * 0.5;
    const jackCals = (repsMap.jumping_jacks || 0) * 0.4;
    return squatCals + jumpCals + pushupCals + lungeCals + jackCals;
  }, [repsMap]);

  // Push floating notification badge
  const addNotification = useCallback((text: string, type: 'points' | 'streak' | 'feedback' | 'multiplier') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setNotifications((prev) => [...prev, { id, text, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1800);
  }, []);

  // Workout Session Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (workoutState === 'active') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // 30s Challenge Countdown
        if (gameMode === 'challenge_30s') {
          setChallengeSecondsLeft((prev) => {
            if (prev <= 1) {
              // Challenge finished!
              soundEffects.playVictoryFanfare();
              setWorkoutState('completed');
              setShowSummary(true);
              return 0;
            }
            if (prev <= 4) {
              soundEffects.playCountdownTick(prev === 1);
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutState, gameMode]);

  // Streak expiration check: streak drops back to 0 if no rep within 4.5 seconds
  useEffect(() => {
    let streakTimer: NodeJS.Timeout | null = null;
    if (workoutState === 'active' && currentStreak > 0 && lastRepTime > 0) {
      streakTimer = setInterval(() => {
        if (Date.now() - lastRepTime > 4500) {
          setCurrentStreak(0);
        }
      }, 500);
    }
    return () => {
      if (streakTimer) clearInterval(streakTimer);
    };
  }, [workoutState, currentStreak, lastRepTime]);

  // Handle Rep Completed
  const handleRepCompleted = useCallback((exercise: ExerciseType) => {
    const now = Date.now();
    setLastRepTime(now);

    // Calculate new streak
    setCurrentStreak((prevStreak) => {
      const nextStreak = prevStreak + 1;
      setBestStreak((prevBest) => Math.max(prevBest, nextStreak));

      // Determine active multiplier for this rep
      const activeMult = nextStreak >= 10 ? 3 : nextStreak >= 5 ? 2 : 1;
      const pointsEarned = 10 * activeMult;

      // Update total score
      setScore((s) => s + pointsEarned);

      // Play rep SFX
      soundEffects.playRepSound(activeMult);

      // Notification
      if (activeMult > 1) {
        addNotification(`+${pointsEarned} PTS (${activeMult}x COMBO!)`, 'points');
      } else {
        addNotification(`+${pointsEarned} PTS`, 'points');
      }

      // Special milestone triggers
      if (nextStreak === 5) {
        soundEffects.playStreakBonusSound(5);
        addNotification('🔥 5 STREAK! 2X MULTIPLIER UNLOCKED', 'streak');
      } else if (nextStreak === 10) {
        soundEffects.playStreakBonusSound(10);
        addNotification('⚡ 10 STREAK! 3X MAX MULTIPLIER UNSTOPPABLE!', 'multiplier');
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#00d4aa', '#7c3aed', '#f59e0b'],
          });
        } catch {
          // ignore
        }
      }

      return nextStreak;
    });

    // Update reps count per exercise
    setRepsMap((prev) => ({
      ...prev,
      [exercise]: (prev[exercise] || 0) + 1,
    }));

    // Routine Mode: Track step progression
    if (gameMode === 'routine') {
      setRoutineSteps((prevSteps) => {
        const nextSteps = [...prevSteps];
        const step = nextSteps[currentRoutineIndex];
        if (step && step.exerciseId === exercise) {
          const newCompleted = step.completedReps + 1;
          step.completedReps = newCompleted;

          if (newCompleted >= step.targetReps && !step.isCompleted) {
            step.isCompleted = true;
            // Check if routine has more exercises
            if (currentRoutineIndex < nextSteps.length - 1) {
              const nextIdx = currentRoutineIndex + 1;
              setCurrentRoutineIndex(nextIdx);
              setCurrentExercise(nextSteps[nextIdx].exerciseId);
              trackerManager.resetAll();
              addNotification(`Step Complete! Next: ${EXERCISE_DEFINITIONS[nextSteps[nextIdx].exerciseId].name}`, 'streak');
            } else {
              // Full routine finished!
              soundEffects.playVictoryFanfare();
              setWorkoutState('completed');
              setShowSummary(true);
            }
          }
        }
        return nextSteps;
      });
    }
  }, [gameMode, currentRoutineIndex, trackerManager, addNotification]);

  // Workout Controls Handlers
  const handleStartWorkout = () => {
    trackerManager.resetAll();
    setCurrentStreak(0);
    setLastRepTime(0);

    if (gameMode === 'challenge_30s') {
      setChallengeSecondsLeft(30);
    } else if (gameMode === 'routine') {
      setCurrentRoutineIndex(0);
      setCurrentExercise(routineSteps[0].exerciseId);
      setRoutineSteps(INITIAL_ROUTINE_STEPS.map((s) => ({ ...s, completedReps: 0, isCompleted: false })));
    }

    setWorkoutState('active');
    soundEffects.playCountdownTick(true);
  };

  const handlePauseResume = () => {
    setWorkoutState((prev) => (prev === 'active' ? 'paused' : 'active'));
  };

  const handleRestart = () => {
    trackerManager.resetAll();
    setScore(0);
    setCurrentStreak(0);
    setElapsedSeconds(0);
    setChallengeSecondsLeft(30);
    setRepsMap({
      squats: 0,
      jumps: 0,
      pushups: 0,
      lunges: 0,
      jumping_jacks: 0,
    });
    setRoutineSteps(INITIAL_ROUTINE_STEPS.map((s) => ({ ...s, completedReps: 0, isCompleted: false })));
    setCurrentRoutineIndex(0);
    setWorkoutState('idle');
  };

  const handleEndWorkout = () => {
    setWorkoutState('completed');
    setShowSummary(true);
    soundEffects.playVictoryFanfare();
  };

  const handleSelectMode = (newMode: GameMode) => {
    setGameMode(newMode);
    trackerManager.resetAll();
    setCurrentStreak(0);
    if (newMode === 'routine') {
      setCurrentRoutineIndex(0);
      setCurrentExercise(routineSteps[0].exerciseId);
    }
  };

  const handleSelectExercise = (exercise: ExerciseType) => {
    if (gameMode === 'routine') return; // in routine mode, sequence is locked
    setCurrentExercise(exercise);
    trackerManager.resetExercise(exercise);
    setCurrentStreak(0);
  };

  const handleRoutineNextExercise = () => {
    if (currentRoutineIndex < routineSteps.length - 1) {
      const nextIdx = currentRoutineIndex + 1;
      setCurrentRoutineIndex(nextIdx);
      setCurrentExercise(routineSteps[nextIdx].exerciseId);
      trackerManager.resetAll();
    } else {
      setWorkoutState('completed');
      setShowSummary(true);
    }
  };

  const handleRoutineSkipExercise = () => {
    handleRoutineNextExercise();
  };

  const handleToggleMute = () => {
    const isNowMuted = soundEffects.toggleMute();
    setIsMuted(isNowMuted);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentExerciseDef = EXERCISE_DEFINITIONS[currentExercise];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#00d4aa] selection:text-[#0f0f1a]">
      {/* 1. Header with Top Bar Contract */}
      <Header
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onNavigateSection={scrollToSection}
        onQuickStart={() => {
          if (workoutState === 'active') {
            handleEndWorkout();
          } else {
            handleStartWorkout();
          }
        }}
        isWorkoutActive={workoutState === 'active'}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title Banner & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-white tracking-wide flex items-center gap-3">
              <span>PoseFit Arena</span>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00d4aa]/15 border border-[#00d4aa]/30 text-[#00d4aa]">
                MoveNet AI
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Your Body. Your Arena. Your Challenge.
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Browser-Powered WebRTC</span>
            <span>·</span>
            <span>Zero Server Latency</span>
          </div>
        </div>

        {/* 2. Live ScoreBoard Metrics */}
        <ScoreBoard
          score={score}
          totalReps={totalReps}
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          multiplier={multiplier}
          elapsedSeconds={elapsedSeconds}
          estimatedCalories={estimatedCalories}
          exerciseName={currentExerciseDef.name}
          gameMode={
            gameMode === 'challenge_30s'
              ? '30s Challenge'
              : gameMode === 'routine'
              ? 'Routine Circuit'
              : 'Free Play'
          }
        />

        {/* 3. Routine Progress Bar (Only visible in Routine Mode) */}
        {gameMode === 'routine' && (
          <RoutineProgress
            steps={routineSteps}
            currentStepIndex={currentRoutineIndex}
            onNextExercise={handleRoutineNextExercise}
            onSkipExercise={handleRoutineSkipExercise}
          />
        )}

        {/* 4. Main Arena: Live Webcam & Canvas Overlay */}
        <div className="relative">
          <CameraView
            workoutState={workoutState}
            gameMode={gameMode}
            currentExercise={currentExercise}
            isMirrored={isMirrored}
            isCameraActive={isCameraActive}
            challengeSecondsLeft={challengeSecondsLeft}
            onRepCompleted={handleRepCompleted}
            onTrackerFeedback={() => {}}
            onModelReadyChange={setIsModelReady}
            onCameraErrorChange={setCameraError}
            trackerManager={trackerManager}
          />

          {/* Floating Points & Multiplier Overlays */}
          <FloatingFeedback notifications={notifications} />
        </div>

        {/* 5. Workout Playback & Camera Controls */}
        <WorkoutControls
          workoutState={workoutState}
          isCameraActive={isCameraActive}
          isModelReady={isModelReady}
          cameraError={cameraError}
          isMirrored={isMirrored}
          isMuted={isMuted}
          onStart={handleStartWorkout}
          onPauseResume={handlePauseResume}
          onRestart={handleRestart}
          onEnd={handleEndWorkout}
          onToggleCamera={() => setIsCameraActive((prev) => !prev)}
          onToggleMirror={() => setIsMirrored((prev) => !prev)}
          onToggleMute={handleToggleMute}
        />

        {/* 6. Game Mode Selector */}
        <GameModeSelector
          currentMode={gameMode}
          onSelectMode={handleSelectMode}
          disabled={workoutState === 'active'}
        />

        {/* 7. Exercise Selector */}
        <ExerciseSelector
          currentExercise={currentExercise}
          onSelectExercise={handleSelectExercise}
          repsMap={repsMap}
          disabled={gameMode === 'routine'}
        />

        {/* 8. Exercise Form Instructions & Tips */}
        <ExerciseInstructions exercise={currentExerciseDef} />
      </main>

      {/* 9. Workout Summary Modal */}
      {showSummary && (
        <WorkoutSummary
          score={score}
          totalReps={totalReps}
          bestStreak={bestStreak}
          elapsedSeconds={elapsedSeconds}
          estimatedCalories={estimatedCalories}
          gameMode={gameMode}
          repsMap={repsMap}
          onPlayAgain={() => {
            setShowSummary(false);
            handleStartWorkout();
          }}
          onClose={() => setShowSummary(false)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="w-full border-t border-white/5 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PoseFit Arena</span>
            <span>·</span>
            <span>AI Motion Tracking Fitness Gaming</span>
          </div>
          <div>
            <span>Powered by MoveNet SinglePose Lightning & TensorFlow.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
