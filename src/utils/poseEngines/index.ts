import { ExerciseDefinition, ExerciseType, Keypoint, RepDetectionResult } from '../../types/fitness';
import { SquatDetector } from './squats';
import { JumpDetector } from './jumps';
import { PushupDetector } from './pushups';
import { LungeDetector } from './lunges';
import { JumpingJackDetector } from './jumpingJacks';

export const EXERCISE_DEFINITIONS: Record<ExerciseType, ExerciseDefinition> = {
  squats: {
    id: 'squats',
    name: 'Squats',
    category: 'Lower Body Strength',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    description: 'Track knee angles to ensure deep 90° squats and full hip extension on every rep.',
    instructions: [
      'Stand facing the camera with feet shoulder-width apart.',
      'Descend by bending knees until thighs are parallel to ground (knee angle ≤ 90°).',
      'Drive back up through heels to full standing position (knee angle ≥ 160°).',
    ],
    proTips: [
      'Keep your chest proud and avoid letting knees cave inward.',
      'Ensure hips, knees, and ankles stay within camera frame.',
    ],
    image: '/src/assets/images/posefit_squat_card_1792496020076.jpg',
    defaultRoutineTarget: 8,
  },
  jumps: {
    id: 'jumps',
    name: 'Jumps',
    category: 'Cardio & Explosive Power',
    targetMuscles: ['Calves', 'Quadriceps', 'Glutes', 'Cardio'],
    description: 'Tracks vertical hip displacement. Explode upward and land softly.',
    instructions: [
      'Stand steady for 1 second to calibrate your ground baseline.',
      'Bend knees slightly and explode into a vertical leap.',
      'Land on the balls of your feet with knees soft.',
    ],
    proTips: [
      'Ensure your full torso and head have headroom to jump without leaving the frame.',
      'Quick continuous rebounds build explosive power.',
    ],
    image: '/src/assets/images/posefit_jump_card_1792496020406.jpg',
    defaultRoutineTarget: 10,
  },
  pushups: {
    id: 'pushups',
    name: 'Push-ups',
    category: 'Upper Body & Core',
    targetMuscles: ['Pectorals', 'Triceps', 'Deltoids', 'Core'],
    description: 'Calculates elbow flexion down to 90° and full lockout extension.',
    instructions: [
      'Assume high plank position sideways or diagonal to the webcam.',
      'Lower chest until elbows reach a 90° angle.',
      'Push firmly back up until arms are fully locked out.',
    ],
    proTips: [
      'Keep body in a rigid straight line from neck to heels.',
      'Position camera slightly elevated so arms and torso are visible.',
    ],
    image: '/src/assets/images/posefit_pushup_card_1792496021229.jpg',
    defaultRoutineTarget: 6,
  },
  lunges: {
    id: 'lunges',
    name: 'Lunges',
    category: 'Unilateral Leg Stability',
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Balance'],
    description: 'Tracks alternating knee angles, ensuring balanced reps between left and right legs.',
    instructions: [
      'Step one leg forward into a deep lunge until front knee is at 90°.',
      'Keep back knee hovering just above the ground.',
      'Press through front foot to return to standing, then switch legs.',
    ],
    proTips: [
      'Keep torso upright throughout the movement.',
      'The tracker alternates automatically between left and right legs.',
    ],
    image: '/src/assets/images/posefit_lunge_card_1792496020936.jpg',
    defaultRoutineTarget: 8,
  },
  jumping_jacks: {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'Full Body Aerobic',
    targetMuscles: ['Shoulders', 'Calves', 'Hip Abductors', 'Cardiovascular'],
    description: 'Tracks wrist overhead spread and ankle separation for synchronized rhythm.',
    instructions: [
      'Start standing with feet together and arms at your sides.',
      'Jump feet outward while raising arms overhead into a wide star shape.',
      'Jump back to starting position with feet together and arms down.',
    ],
    proTips: [
      'Step back 6-8 feet so your full body and outstretched arms fit the frame.',
      'Keep a steady athletic bounce rhythm for maximum streak points.',
    ],
    image: '/src/assets/images/posefit_jumpingjack_card_1792496021405.jpg',
    defaultRoutineTarget: 12,
  },
};

export class ExerciseTrackerManager {
  private squatDetector = new SquatDetector();
  private jumpDetector = new JumpDetector();
  private pushupDetector = new PushupDetector();
  private lungeDetector = new LungeDetector();
  private jumpingJackDetector = new JumpingJackDetector();

  public resetAll() {
    this.squatDetector.reset();
    this.jumpDetector.reset();
    this.pushupDetector.reset();
    this.lungeDetector.reset();
    this.jumpingJackDetector.reset();
  }

  public resetExercise(type: ExerciseType) {
    switch (type) {
      case 'squats':
        this.squatDetector.reset();
        break;
      case 'jumps':
        this.jumpDetector.reset();
        break;
      case 'pushups':
        this.pushupDetector.reset();
        break;
      case 'lunges':
        this.lungeDetector.reset();
        break;
      case 'jumping_jacks':
        this.jumpingJackDetector.reset();
        break;
    }
  }

  public process(exerciseType: ExerciseType, keypoints: Keypoint[], videoHeight: number = 480): RepDetectionResult {
    switch (exerciseType) {
      case 'squats':
        return this.squatDetector.process(keypoints);
      case 'jumps':
        return this.jumpDetector.process(keypoints, videoHeight);
      case 'pushups':
        return this.pushupDetector.process(keypoints);
      case 'lunges':
        return this.lungeDetector.process(keypoints);
      case 'jumping_jacks':
        return this.jumpingJackDetector.process(keypoints);
      default:
        return {
          isRepCompleted: false,
          phase: 'idle',
          feedback: 'Select an exercise to start',
          progressPercentage: 0,
        };
    }
  }
}
