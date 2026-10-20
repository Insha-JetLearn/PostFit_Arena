import { Keypoint, RepDetectionResult } from '../../types/fitness';
import { calculateAngle, getKeypoint, MovingAverage } from '../geometry';

export class LungeDetector {
  private phase: 'standing' | 'lunging' | 'bottom' | 'rising' = 'standing';
  private activeSide: 'left' | 'right' = 'left';
  private lastRepTimestamp = 0;
  private minAngleAchieved = 180;
  private smoothedLeftKnee = new MovingAverage(0.35);
  private smoothedRightKnee = new MovingAverage(0.35);

  public reset() {
    this.phase = 'standing';
    this.activeSide = 'left';
    this.lastRepTimestamp = 0;
    this.minAngleAchieved = 180;
    this.smoothedLeftKnee.reset();
    this.smoothedRightKnee.reset();
  }

  public process(keypoints: Keypoint[]): RepDetectionResult {
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const leftKnee = getKeypoint(keypoints, 'left_knee');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');

    const rightHip = getKeypoint(keypoints, 'right_hip');
    const rightKnee = getKeypoint(keypoints, 'right_knee');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');

    let leftAngle: number | null = null;
    let rightAngle: number | null = null;

    if (leftHip && leftKnee && leftAnkle) {
      leftAngle = Math.round(this.smoothedLeftKnee.update(calculateAngle(leftHip, leftKnee, leftAnkle)));
    }
    if (rightHip && rightKnee && rightAnkle) {
      rightAngle = Math.round(this.smoothedRightKnee.update(calculateAngle(rightHip, rightKnee, rightAnkle)));
    }

    if (leftAngle === null && rightAngle === null) {
      return {
        isRepCompleted: false,
        phase: this.phase,
        feedback: 'Position legs in frame for lunge tracking',
        progressPercentage: 0,
        side: this.activeSide,
      };
    }

    // Determine working leg (the one bending deeper)
    let currentWorkingAngle = 180;
    if (leftAngle !== null && rightAngle !== null) {
      if (this.phase === 'standing') {
        if (leftAngle < rightAngle - 10 && leftAngle < 145) {
          this.activeSide = 'left';
          currentWorkingAngle = leftAngle;
        } else if (rightAngle < leftAngle - 10 && rightAngle < 145) {
          this.activeSide = 'right';
          currentWorkingAngle = rightAngle;
        } else {
          currentWorkingAngle = Math.min(leftAngle, rightAngle);
        }
      } else {
        currentWorkingAngle = this.activeSide === 'left' ? leftAngle : rightAngle;
      }
    } else if (leftAngle !== null) {
      currentWorkingAngle = leftAngle;
      this.activeSide = 'left';
    } else if (rightAngle !== null) {
      currentWorkingAngle = rightAngle;
      this.activeSide = 'right';
    }

    const now = Date.now();
    let isRepCompleted = false;
    let feedback = `Step forward with ${this.activeSide} leg`;

    const progress = Math.min(100, Math.max(0, Math.round(((165 - currentWorkingAngle) / (165 - 95)) * 100)));

    if (this.phase === 'standing') {
      if (currentWorkingAngle < 145) {
        this.phase = 'lunging';
        this.minAngleAchieved = currentWorkingAngle;
        feedback = `Lower into ${this.activeSide} lunge`;
      } else {
        feedback = `Ready for ${this.activeSide} leg lunge`;
      }
    } else if (this.phase === 'lunging') {
      if (currentWorkingAngle < this.minAngleAchieved) {
        this.minAngleAchieved = currentWorkingAngle;
      }

      if (currentWorkingAngle <= 98) {
        this.phase = 'bottom';
        feedback = 'Great depth! Push back to start';
      } else if (currentWorkingAngle > 155 && this.minAngleAchieved > 115) {
        this.phase = 'standing';
        feedback = 'Lunge deeper down to 90 degrees';
      } else {
        feedback = 'Drop rear knee toward floor...';
      }
    } else if (this.phase === 'bottom') {
      if (currentWorkingAngle > 105) {
        this.phase = 'rising';
        feedback = 'Step back to standing';
      }
    } else if (this.phase === 'rising') {
      if (currentWorkingAngle >= 155) {
        if (now - this.lastRepTimestamp > 600 && this.minAngleAchieved <= 100) {
          isRepCompleted = true;
          this.lastRepTimestamp = now;
          const finishedSide = this.activeSide;
          // Alternate to other leg for balance
          this.activeSide = finishedSide === 'left' ? 'right' : 'left';
          feedback = `${finishedSide.toUpperCase()} rep done! Now switch to ${this.activeSide}`;
        }
        this.phase = 'standing';
        this.minAngleAchieved = 180;
      } else {
        feedback = 'Stand up fully to complete';
      }
    }

    return {
      isRepCompleted,
      currentAngle: currentWorkingAngle,
      targetAngle: 90,
      phase: this.phase,
      feedback,
      side: this.activeSide,
      progressPercentage: progress,
    };
  }
}
