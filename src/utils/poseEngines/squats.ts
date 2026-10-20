import { Keypoint, RepDetectionResult } from '../../types/fitness';
import { calculateAngle, getKeypoint, MovingAverage } from '../geometry';

export class SquatDetector {
  private phase: 'up' | 'descending' | 'bottom' | 'ascending' = 'up';
  private lastRepTimestamp = 0;
  private minAngleAchieved = 180;
  private smoothedAngle = new MovingAverage(0.35);

  public reset() {
    this.phase = 'up';
    this.lastRepTimestamp = 0;
    this.minAngleAchieved = 180;
    this.smoothedAngle.reset();
  }

  public process(keypoints: Keypoint[]): RepDetectionResult {
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const leftKnee = getKeypoint(keypoints, 'left_knee');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');

    const rightHip = getKeypoint(keypoints, 'right_hip');
    const rightKnee = getKeypoint(keypoints, 'right_knee');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');

    let rawAngle: number | null = null;

    if (leftHip && leftKnee && leftAnkle && rightHip && rightKnee && rightAnkle) {
      const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      rawAngle = (leftAngle + rightAngle) / 2;
    } else if (leftHip && leftKnee && leftAnkle) {
      rawAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    } else if (rightHip && rightKnee && rightAnkle) {
      rawAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    }

    if (rawAngle === null) {
      return {
        isRepCompleted: false,
        phase: this.phase,
        feedback: 'Position full body in frame (hips, knees, feet)',
        progressPercentage: 0,
      };
    }

    const angle = Math.round(this.smoothedAngle.update(rawAngle));
    const now = Date.now();
    let isRepCompleted = false;
    let feedback = 'Stand tall to start';

    // Progress calculation: 160 deg is 0%, 90 deg is 100%
    const progress = Math.min(100, Math.max(0, Math.round(((165 - angle) / (165 - 90)) * 100)));

    if (this.phase === 'up') {
      if (angle < 150) {
        this.phase = 'descending';
        this.minAngleAchieved = angle;
        feedback = 'Squat deeper';
      } else {
        feedback = 'Bend knees down into a squat';
      }
    } else if (this.phase === 'descending') {
      if (angle < this.minAngleAchieved) {
        this.minAngleAchieved = angle;
      }

      if (angle <= 95) {
        this.phase = 'bottom';
        feedback = 'Great depth! Push back up';
      } else if (angle > 155 && this.minAngleAchieved > 115) {
        // Reset if didn't go deep enough
        this.phase = 'up';
        feedback = 'Go deeper for a full rep (90°)';
      } else {
        feedback = 'Squat deeper...';
      }
    } else if (this.phase === 'bottom') {
      if (angle > 105) {
        this.phase = 'ascending';
        feedback = 'Drive through your heels';
      } else {
        feedback = 'Push up to standing';
      }
    } else if (this.phase === 'ascending') {
      if (angle >= 155) {
        if (now - this.lastRepTimestamp > 600 && this.minAngleAchieved <= 98) {
          isRepCompleted = true;
          this.lastRepTimestamp = now;
          feedback = 'Rep counted! Solid squat!';
        }
        this.phase = 'up';
        this.minAngleAchieved = 180;
      } else {
        feedback = 'Stand up to complete the rep';
      }
    }

    return {
      isRepCompleted,
      currentAngle: angle,
      targetAngle: 90,
      phase: this.phase,
      feedback,
      progressPercentage: progress,
    };
  }
}
