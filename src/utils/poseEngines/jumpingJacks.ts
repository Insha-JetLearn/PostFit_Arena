import { Keypoint, RepDetectionResult } from '../../types/fitness';
import { calculateDistance, getKeypoint, MovingAverage } from '../geometry';

export class JumpingJackDetector {
  private phase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  private lastRepTimestamp = 0;
  private maxOpenScore = 0;
  private smoothedOpenScore = new MovingAverage(0.35);

  public reset() {
    this.phase = 'closed';
    this.lastRepTimestamp = 0;
    this.maxOpenScore = 0;
    this.smoothedOpenScore.reset();
  }

  public process(keypoints: Keypoint[]): RepDetectionResult {
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
    const leftWrist = getKeypoint(keypoints, 'left_wrist');
    const rightWrist = getKeypoint(keypoints, 'right_wrist');
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const rightHip = getKeypoint(keypoints, 'right_hip');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');

    if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist || !leftHip || !rightHip) {
      return {
        isRepCompleted: false,
        phase: this.phase,
        feedback: 'Show upper body and arms clearly in frame',
        progressPercentage: 0,
      };
    }

    const shoulderDist = Math.max(20, calculateDistance(leftShoulder, rightShoulder));
    const wristDist = calculateDistance(leftWrist, rightWrist);
    const wristToShoulderRatio = wristDist / shoulderDist;

    // Arms vertical position: are hands above shoulders?
    // In canvas coords, smaller y means higher up
    const handsAboveShoulders = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;

    // Legs spread ratio
    let legsSpreadRatio = 1.0;
    if (leftAnkle && rightAnkle) {
      const hipDist = Math.max(20, calculateDistance(leftHip, rightHip));
      const ankleDist = calculateDistance(leftAnkle, rightAnkle);
      legsSpreadRatio = ankleDist / hipDist;
    }

    // Composite openness metric (0 when arms at sides & feet together, ~100+ when star position)
    let rawOpenness = 0;
    if (handsAboveShoulders) {
      rawOpenness = (wristToShoulderRatio * 25) + (legsSpreadRatio * 35);
    } else {
      rawOpenness = (wristToShoulderRatio * 15) + (legsSpreadRatio * 20);
    }

    const openScore = Math.round(this.smoothedOpenScore.update(rawOpenness));
    const now = Date.now();
    let isRepCompleted = false;
    let feedback = 'Stand with feet together & arms at sides';

    // 40 is closed, 85 is open
    const progress = Math.min(100, Math.max(0, Math.round(((openScore - 40) / 45) * 100)));

    if (this.phase === 'closed') {
      if (openScore > 55 || handsAboveShoulders) {
        this.phase = 'opening';
        this.maxOpenScore = openScore;
        feedback = 'Spread arms & legs!';
      } else {
        feedback = 'Jump feet out and raise arms';
      }
    } else if (this.phase === 'opening') {
      if (openScore > this.maxOpenScore) {
        this.maxOpenScore = openScore;
      }

      if (handsAboveShoulders && (openScore >= 75 || legsSpreadRatio > 1.4)) {
        this.phase = 'open';
        feedback = 'Full star! Now return together';
      } else {
        feedback = 'Spread your arms and legs wide';
      }
    } else if (this.phase === 'open') {
      if (!handsAboveShoulders || openScore < 65) {
        this.phase = 'closing';
        feedback = 'Bring arms and feet together';
      } else {
        feedback = 'Bring feet together!';
      }
    } else if (this.phase === 'closing') {
      if (openScore <= 48 && !handsAboveShoulders) {
        if (now - this.lastRepTimestamp > 500 && this.maxOpenScore >= 72) {
          isRepCompleted = true;
          this.lastRepTimestamp = now;
          feedback = 'Jumping jack complete!';
        }
        this.phase = 'closed';
        this.maxOpenScore = 0;
      } else {
        feedback = 'Bring feet together & arms to sides';
      }
    }

    return {
      isRepCompleted,
      currentAngle: openScore,
      targetAngle: 85,
      phase: this.phase,
      feedback,
      progressPercentage: progress,
    };
  }
}
