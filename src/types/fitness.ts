export type ExerciseType = 'squats' | 'jumps' | 'pushups' | 'lunges' | 'jumping_jacks';

export type GameMode = 'free_play' | 'challenge_30s' | 'routine';

export type WorkoutState = 'idle' | 'ready' | 'active' | 'paused' | 'completed';

export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

export interface ExerciseDefinition {
  id: ExerciseType;
  name: string;
  category: string;
  targetMuscles: string[];
  description: string;
  instructions: string[];
  proTips: string[];
  image: string;
  defaultRoutineTarget: number;
}

export interface RepDetectionResult {
  isRepCompleted: boolean;
  currentAngle?: number;
  targetAngle?: number;
  phase: string;
  feedback: string;
  side?: 'left' | 'right';
  progressPercentage: number;
}

export interface ExerciseStats {
  reps: number;
  score: number;
  calories: number;
  accuracyRate: number;
  bestStreak: number;
}

export interface FloatingNotification {
  id: string;
  text: string;
  type: 'points' | 'streak' | 'feedback' | 'multiplier';
  timestamp: number;
}

export interface RoutineStep {
  exerciseId: ExerciseType;
  targetReps: number;
  completedReps: number;
  isCompleted: boolean;
}
