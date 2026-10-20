import { Keypoint } from '../types/fitness';

export const KEYPOINT_NAMES = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
] as const;

export type KeypointName = typeof KEYPOINT_NAMES[number];

/**
 * Find keypoint by index or name
 */
export function getKeypoint(keypoints: Keypoint[], nameOrIndex: KeypointName | number, minScore: number = 0.3): Keypoint | null {
  if (typeof nameOrIndex === 'number') {
    const kp = keypoints[nameOrIndex];
    if (kp && (kp.score === undefined || kp.score >= minScore)) {
      return kp;
    }
    return null;
  }
  const idx = KEYPOINT_NAMES.indexOf(nameOrIndex);
  if (idx !== -1) {
    const kp = keypoints[idx];
    if (kp && (kp.score === undefined || kp.score >= minScore)) {
      return kp;
    }
  }
  // Also check if kp has name property
  const namedKp = keypoints.find((k) => k.name === nameOrIndex);
  if (namedKp && (namedKp.score === undefined || namedKp.score >= minScore)) {
    return namedKp;
  }
  return null;
}

/**
 * Calculate angle between three points A -> B -> C (vertex is at B)
 * Returns degrees [0, 180]
 */
export function calculateAngle(pointA: Keypoint, pointB: Keypoint, pointC: Keypoint): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Calculate Euclidean distance between two keypoints
 */
export function calculateDistance(pointA: Keypoint, pointB: Keypoint): number {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Exponential moving average filter for smoothing noisy joint signals
 */
export class MovingAverage {
  private value: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.35) {
    this.alpha = alpha;
  }

  public update(newValue: number): number {
    if (this.value === null) {
      this.value = newValue;
    } else {
      this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  public get(): number {
    return this.value ?? 0;
  }

  public reset() {
    this.value = null;
  }
}
