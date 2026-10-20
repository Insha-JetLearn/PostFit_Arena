/**
 * Shim for @mediapipe/pose to satisfy bundler named exports when using MoveNet.
 */
const g = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {};

export const Pose = (g.Pose as unknown) || class Pose {
  constructor(_opts?: unknown) {}
  onResults(_fn: unknown) {}
  send(_input: unknown) { return Promise.resolve(); }
  initialize() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
  setOptions(_opts: unknown) {}
  reset() {}
};

export const POSE_CONNECTIONS = g.POSE_CONNECTIONS || [];
export const POSE_LANDMARKS = g.POSE_LANDMARKS || {};
export const POSE_LANDMARKS_LEFT = g.POSE_LANDMARKS_LEFT || {};
export const POSE_LANDMARKS_RIGHT = g.POSE_LANDMARKS_RIGHT || {};
export const POSE_LANDMARKS_NEUTRAL = g.POSE_LANDMARKS_NEUTRAL || {};
export const VERSION = '0.5.1675469404';

export default {
  Pose,
  POSE_CONNECTIONS,
  POSE_LANDMARKS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  POSE_LANDMARKS_NEUTRAL,
  VERSION,
};
