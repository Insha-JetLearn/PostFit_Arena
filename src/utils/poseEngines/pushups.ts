import { Keypoint, RepDetectionResult } from '../../types/fitness';
import { calculateAngle, getKeypoint, MovingAverage } from '../geometry';

export class PushupDetector {
  private phase: 'up' | 'lowering' | 'bottom' | 'pushing' = 'up';
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
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const leftElbow = getKeypoint(keypoints, 'left_elbow');
    const leftWrist = getKeypoint(keypoints, 'left_wrist');

    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
    const rightElbow = getKeypoint(keypoints, 'right_elbow');
    const rightWrist = getKeypoint(keypoints, 'right_wrist');

    let rawAngle: number | null = null;

    if (leftShoulder && leftElbow && leftWrist && rightShoulder && rightElbow && rightWrist) {
      const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      rawAngle = (leftAngle + rightAngle) / 2;
    } else if (leftShoulder && leftElbow && leftWrist) {
      rawAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    } else if (rightShoulder && rightElbow && rightWrist) {
      rawAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    }

    if (rawAngle === null) {
      return {
        isRepCompleted: false,
        phase: this.phase,
        feedback: 'Position arms & shoulders clearly in frame',
        progressPercentage: 0,
      };
    }

    const angle = Math.round(this.smoothedAngle.update(rawAngle));
    const now = Date.now();
    let isRepCompleted = false;
    let feedback = 'Hold strong plank';

    // 160 deg is 0%, 90 deg is 100%
    const progress = Math.min(100, Math.max(0, Math.round(((160 - angle) / (160 - 90)) * 100)));

    if (this.phase === 'up') {
      if (angle < 145) {
        this.phase = 'lowering';
        this.minAngleAchieved = angle;
        feedback = 'Lower your body';
      } else {
        feedback = 'Lower your chest to the floor';
      }
    } else if (this.phase === 'lowering') {
      if (angle < this.minAngleAchieved) {
        this.minAngleAchieved = angle;
      }

      if (angle <= 92) {
        this.phase = 'bottom';
        feedback = 'Great depth! Push back up';
      } else if (angle > 150 && this.minAngleAchieved > 110) {
        this.phase = 'up';
        feedback = 'Lower deeper to 90 degrees';
      } else {
        feedback = 'Lower your body smoothly...';
      }
    } else if (this.phase === 'bottom') {
      if (angle > 105) {
        this.phase = 'pushing';
        feedback = 'Push back up!';
      } else {
        feedback = 'Drive through your palms';
      }
    } else if (this.phase === 'pushing') {
      if (angle >= 152) {
        if (now - this.lastRepTimestamp > 600 && this.minAngleAchieved <= 98) {
          isRepCompleted = true;
          this.lastRepTimestamp = now;
          feedback = 'Rep counted! Solid push-up!';
        }
        this.phase = 'up';
        this.minAngleAchieved = 180;
      } else {
        feedback = 'Lock out arms to complete rep';
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
