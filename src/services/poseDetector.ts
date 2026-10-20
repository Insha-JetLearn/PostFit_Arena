import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Keypoint, Pose } from '../types/fitness';

export const SKELETON_PAIRS: [number, number][] = [
  // Face / Head
  [0, 1], // nose -> left_eye
  [0, 2], // nose -> right_eye
  [1, 3], // left_eye -> left_ear
  [2, 4], // right_eye -> right_ear

  // Upper Body
  [5, 6], // left_shoulder -> right_shoulder
  [5, 7], // left_shoulder -> left_elbow
  [7, 9], // left_elbow -> left_wrist
  [6, 8], // right_shoulder -> right_elbow
  [8, 10], // right_elbow -> right_wrist

  // Torso
  [5, 11], // left_shoulder -> left_hip
  [6, 12], // right_shoulder -> right_hip
  [11, 12], // left_hip -> right_hip

  // Lower Body
  [11, 13], // left_hip -> left_knee
  [13, 15], // left_knee -> left_ankle
  [12, 14], // right_hip -> right_knee
  [14, 16], // right_knee -> right_ankle
];

export class PoseDetectorService {
  private detector: poseDetection.PoseDetector | null = null;
  private isInitializing: boolean = false;

  public async init(): Promise<poseDetection.PoseDetector> {
    if (this.detector) {
      return this.detector;
    }
    if (this.isInitializing) {
      // wait until initialized
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.detector) return this.detector;
    }

    this.isInitializing = true;
    try {
      await tf.ready();
      // Set WebGL backend if available
      try {
        await tf.setBackend('webgl');
      } catch (backendErr) {
        console.warn('WebGL backend fallback to default tfjs backend:', backendErr);
      }

      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        }
      );
      return this.detector;
    } finally {
      this.isInitializing = false;
    }
  }

  public async estimatePoses(video: HTMLVideoElement): Promise<Pose[]> {
    if (!this.detector || video.readyState < 2) {
      return [];
    }
    try {
      const poses = await this.detector.estimatePoses(video, {
        maxPoses: 1,
        flipHorizontal: false,
      });
      return poses as unknown as Pose[];
    } catch (err) {
      console.error('Error during pose estimation:', err);
      return [];
    }
  }

  public dispose() {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
  }
}

export const poseDetectorService = new PoseDetectorService();

/**
 * Draws the detected body keypoints and connecting skeleton lines onto the HTML5 Canvas
 */
export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  minConfidence: number = 0.35,
  accentColor: string = '#00d4aa', // Neon teal
  jointColor: string = '#ffffff'
) {
  if (!keypoints || keypoints.length === 0) return;

  const scaleX = canvasWidth / (videoWidth || canvasWidth);
  const scaleY = canvasHeight / (videoHeight || canvasHeight);

  // 1. Draw connecting skeleton bones
  ctx.save();
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [idxA, idxB] of SKELETON_PAIRS) {
    const kpA = keypoints[idxA];
    const kpB = keypoints[idxB];

    if (!kpA || !kpB) continue;
    if ((kpA.score ?? 0) < minConfidence || (kpB.score ?? 0) < minConfidence) continue;

    const xA = kpA.x * scaleX;
    const yA = kpA.y * scaleY;
    const xB = kpB.x * scaleX;
    const yB = kpB.y * scaleY;

    // Glowing line gradient
    const gradient = ctx.createLinearGradient(xA, yA, xB, yB);
    gradient.addColorStop(0, accentColor);
    gradient.addColorStop(1, '#7c3aed'); // Neon purple

    // Shadow glow
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(xA, yA);
    ctx.lineTo(xB, yB);
    ctx.stroke();
  }

  // 2. Draw keypoint joint circles
  for (let i = 0; i < keypoints.length; i++) {
    const kp = keypoints[i];
    if (!kp || (kp.score ?? 0) < minConfidence) continue;

    const x = kp.x * scaleX;
    const y = kp.y * scaleY;

    // Outer glow ring
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Inner bright center
    ctx.shadowBlur = 0;
    ctx.fillStyle = jointColor;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.restore();
}
