import { Keypoint, RepDetectionResult } from '../../types/fitness';
import { getKeypoint, MovingAverage } from '../geometry';

export class JumpDetector {
  private baselineHipY: number | null = null;
  private smoothedHipY = new MovingAverage(0.4);
  private lastRepTimestamp = 0;
  private phase: 'ground' | 'airborne' | 'landing' = 'ground';
  private frameCount = 0;
  private highestPointInAir = 0;

  public reset() {
    this.baselineHipY = null;
    this.smoothedHipY.reset();
    this.lastRepTimestamp = 0;
    this.phase = 'ground';
    this.frameCount = 0;
    this.highestPointInAir = 0;
  }

  public process(keypoints: Keypoint[], videoHeight: number = 480): RepDetectionResult {
    this.frameCount++;
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const rightHip = getKeypoint(keypoints, 'right_hip');

    if (!leftHip && !rightHip) {
      return {
        isRepCompleted: false,
        phase: this.phase,
        feedback: 'Position body so hips and legs are visible',
        progressPercentage: 0,
      };
    }

    const currentRawY = (leftHip && rightHip)
      ? (leftHip.y + rightHip.y) / 2
      : (leftHip ? leftHip.y : rightHip!.y);

    const hipY = this.smoothedHipY.update(currentRawY);
    const now = Date.now();
    let isRepCompleted = false;
    let feedback = 'Get ready to jump!';

    // Calibrate baseline hip position during ground/steady state
    if (this.baselineHipY === null) {
      this.baselineHipY = hipY;
    } else if (this.phase === 'ground' && Math.abs(hipY - this.baselineHipY) < videoHeight * 0.05) {
      // Slow drift calibration when standing still
      this.baselineHipY = 0.95 * this.baselineHipY + 0.05 * hipY;
    }

    // Displacement: in video coordinates, top is 0, so moving UP means hipY DECREASES
    const verticalElevation = this.baselineHipY - hipY;
    const jumpThreshold = Math.max(35, videoHeight * 0.12); // ~12-15% of frame height

    const progress = Math.min(100, Math.max(0, Math.round((verticalElevation / jumpThreshold) * 100)));

    if (this.phase === 'ground') {
      if (verticalElevation > jumpThreshold && (now - this.lastRepTimestamp > 600)) {
        this.phase = 'airborne';
        this.highestPointInAir = verticalElevation;
        feedback = 'Jump detected! Nice air!';
      } else {
        feedback = 'Get ready! Explode upward!';
      }
    } else if (this.phase === 'airborne') {
      if (verticalElevation > this.highestPointInAir) {
        this.highestPointInAir = verticalElevation;
      }
      feedback = 'Jump detected!';

      // When falling back towards baseline
      if (verticalElevation < jumpThreshold * 0.5) {
        this.phase = 'landing';
      }
    } else if (this.phase === 'landing') {
      if (verticalElevation <= jumpThreshold * 0.25) {
        isRepCompleted = true;
        this.lastRepTimestamp = now;
        this.phase = 'ground';
        feedback = 'Great jump! Rep counted!';
      } else {
        feedback = 'Stick the landing';
      }
    }

    return {
      isRepCompleted,
      currentAngle: Math.round(verticalElevation),
      targetAngle: Math.round(jumpThreshold),
      phase: this.phase,
      feedback,
      progressPercentage: progress,
    };
  }
}
