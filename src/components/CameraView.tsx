import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ExerciseType, Keypoint, Pose, RepDetectionResult, WorkoutState, GameMode } from '../types/fitness';
import { poseDetectorService, drawPoseSkeleton } from '../services/poseDetector';
import { ExerciseTrackerManager } from '../utils/poseEngines';
import { Camera, RefreshCw, AlertTriangle, ShieldCheck, Flame, Zap } from 'lucide-react';

interface CameraViewProps {
  workoutState: WorkoutState;
  gameMode: GameMode;
  currentExercise: ExerciseType;
  isMirrored: boolean;
  isCameraActive: boolean;
  challengeSecondsLeft: number;
  onRepCompleted: (exercise: ExerciseType) => void;
  onTrackerFeedback: (result: RepDetectionResult) => void;
  onModelReadyChange: (isReady: boolean) => void;
  onCameraErrorChange: (err: string | null) => void;
  trackerManager: ExerciseTrackerManager;
}

export const CameraView: React.FC<CameraViewProps> = ({
  workoutState,
  gameMode,
  currentExercise,
  isMirrored,
  isCameraActive,
  challengeSecondsLeft,
  onRepCompleted,
  onTrackerFeedback,
  onModelReadyChange,
  onCameraErrorChange,
  trackerManager,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [bodyInView, setBodyInView] = useState<boolean>(false);
  const [currentFeedback, setCurrentFeedback] = useState<string>('Stand in view of camera');
  const [repProgress, setRepProgress] = useState<number>(0);
  const [currentAngleDisplay, setCurrentAngleDisplay] = useState<number | undefined>(undefined);

  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastFpsCalcTime = useRef<number>(Date.now());
  const frameCount = useRef<number>(0);

  // Initialize TensorFlow MoveNet model
  useEffect(() => {
    let isMounted = true;
    async function loadModel() {
      setIsLoadingModel(true);
      try {
        await poseDetectorService.init();
        if (isMounted) {
          setIsLoadingModel(false);
          onModelReadyChange(true);
        }
      } catch (err) {
        console.error('Failed to load MoveNet model:', err);
        if (isMounted) {
          setModelError('Failed to load MoveNet pose model. Please refresh.');
          setIsLoadingModel(false);
          onModelReadyChange(false);
        }
      }
    }
    loadModel();
    return () => {
      isMounted = false;
    };
  }, [onModelReadyChange]);

  // Request & Setup Camera Stream
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraPermissionGranted(true);
      onCameraErrorChange(null);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const errMsg = err instanceof Error ? err.message : 'Camera permission was denied.';
      setCameraPermissionGranted(false);
      onCameraErrorChange(errMsg);
    }
  }, [onCameraErrorChange]);

  // Stop Camera Tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Sync camera active state
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive, startCamera, stopCamera]);

  // Main Pose Detection & Rep Counting Loop
  useEffect(() => {
    let isActive = true;

    const detectPoseLoop = async () => {
      if (!isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && !video.paused && !video.ended) {
        // Match canvas dimensions to actual video feed display
        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;

        if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          try {
            const poses: Pose[] = await poseDetectorService.estimatePoses(video);
            const primaryPose = poses && poses.length > 0 ? poses[0] : null;

            if (primaryPose && primaryPose.keypoints && primaryPose.keypoints.length > 0) {
              const visibleKeypoints = primaryPose.keypoints.filter((kp: Keypoint) => (kp.score ?? 0) >= 0.35);
              const hasKeyBodyParts = visibleKeypoints.length >= 6;
              setBodyInView(hasKeyBodyParts);

              // Draw skeleton overlay
              drawPoseSkeleton(
                ctx,
                primaryPose.keypoints,
                videoWidth,
                videoHeight,
                canvas.width,
                canvas.height,
                0.35,
                '#00d4aa',
                '#ffffff'
              );

              // Process rep logic only if workout is actively running
              if (workoutState === 'active') {
                const result = trackerManager.process(currentExercise, primaryPose.keypoints, videoHeight);
                setCurrentFeedback(result.feedback);
                setRepProgress(result.progressPercentage);
                setCurrentAngleDisplay(result.currentAngle);
                onTrackerFeedback(result);

                if (result.isRepCompleted) {
                  onRepCompleted(currentExercise);
                }
              } else if (workoutState === 'paused') {
                setCurrentFeedback('Workout paused. Click Resume to continue.');
              } else {
                setCurrentFeedback('Ready. Press "Start Workout" to begin scoring.');
              }
            } else {
              setBodyInView(false);
              if (workoutState === 'active') {
                setCurrentFeedback('Step back into the camera frame');
              }
            }
          } catch (inferErr) {
            console.error('Frame inference error:', inferErr);
          }
        }

        // Calculate real FPS
        frameCount.current++;
        const now = Date.now();
        if (now - lastFpsCalcTime.current >= 1000) {
          setFps(frameCount.current);
          frameCount.current = 0;
          lastFpsCalcTime.current = now;
        }
      }

      if (isActive) {
        animationFrameId.current = requestAnimationFrame(detectPoseLoop);
      }
    };

    animationFrameId.current = requestAnimationFrame(detectPoseLoop);

    return () => {
      isActive = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [workoutState, currentExercise, trackerManager, onRepCompleted, onTrackerFeedback]);

  return (
    <div
      ref={containerRef}
      id="arena"
      className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[640px] bg-[#0a0a14] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center select-none"
    >
      {/* 1. Underlying HTML5 Video */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transition-transform duration-200 ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
      />

      {/* 2. Transparent Canvas Overlay for Skeleton Keypoints */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
      />

      {/* 3. Gaming Cyber HUD Overlays (Top Edge) */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-20">
        {/* Left: Pose Engine & FPS Telemetry */}
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              bodyInView ? 'bg-[#00d4aa] shadow-[0_0_8px_#00d4aa]' : 'bg-amber-400'
            }`}
          />
          <span className="text-white font-medium">
            {bodyInView ? 'Skeleton Locked' : 'Searching Pose...'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-300 font-mono tabular-nums">{fps} FPS</span>
        </div>

        {/* Center / Right: 30s Challenge Timer or Rep Progress */}
        {gameMode === 'challenge_30s' && workoutState === 'active' && (
          <div className="flex items-center gap-2 bg-[#7c3aed]/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="font-['JetBrains_Mono'] font-extrabold text-lg text-white tabular-nums tracking-wider">
              {challengeSecondsLeft}s
            </span>
          </div>
        )}

        {/* Right: Active Exercise Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white">
          <Flame className="w-3.5 h-3.5 text-[#00d4aa]" />
          <span className="font-['Outfit'] font-bold uppercase tracking-wider">
            {currentExercise.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* 4. Live Form Guidance Banner (Bottom Edge) */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none z-20">
        {/* Real-time coaching feedback pill */}
        <div className="w-full sm:w-auto bg-[#0f0f1a]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-3 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00d4aa] animate-ping shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Form Coach</span>
            <span className="text-sm font-bold text-white tracking-wide truncate max-w-[280px] sm:max-w-[400px]">
              {currentFeedback}
            </span>
          </div>
        </div>

        {/* Rep completion progress meter */}
        {workoutState === 'active' && (
          <div className="w-full sm:w-64 bg-[#0f0f1a]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 flex flex-col gap-1.5 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Rep Depth</span>
              <span className="text-[#00d4aa] font-bold font-mono tabular-nums">{repProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#00d4aa] transition-all duration-150 rounded-full"
                style={{ width: `${repProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Permission / Loading / Error Overlays */}
      {isLoadingModel && (
        <div className="absolute inset-0 bg-[#0f0f1a]/95 flex flex-col items-center justify-center p-6 text-center z-30">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#7c3aed]/20 border border-[#00d4aa]/40 flex items-center justify-center mb-4 animate-spin">
            <RefreshCw className="w-8 h-8 text-[#00d4aa]" />
          </div>
          <h3 className="font-['Outfit'] font-black text-xl text-white mb-2">
            Loading MoveNet Lightning AI...
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Downloading neural network weights for real-time 30 FPS skeletal tracking directly in your browser.
          </p>
        </div>
      )}

      {modelError && (
        <div className="absolute inset-0 bg-[#0f0f1a]/95 flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertTriangle className="w-12 h-12 text-rose-400 mb-3" />
          <h3 className="font-['Outfit'] font-bold text-lg text-white mb-1">AI Model Error</h3>
          <p className="text-xs text-slate-400 mb-4">{modelError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[#00d4aa] text-[#0f0f1a] font-bold text-xs"
          >
            Reload Page
          </button>
        </div>
      )}

      {cameraPermissionGranted === false && (
        <div className="absolute inset-0 bg-[#0f0f1a]/95 flex flex-col items-center justify-center p-6 text-center z-30">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
            <Camera className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="font-['Outfit'] font-black text-xl text-white mb-2">Webcam Access Required</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            PoseFit Arena runs entirely in your browser using local computer vision. No camera footage is ever uploaded or stored.
          </p>
          <button
            onClick={startCamera}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#00b38f] text-[#0f0f1a] font-black text-xs uppercase tracking-wider hover:opacity-90 shadow-lg cursor-pointer"
          >
            Grant Camera Permission
          </button>
        </div>
      )}

      {!isCameraActive && cameraPermissionGranted !== false && !isLoadingModel && (
        <div className="absolute inset-0 bg-[#0f0f1a]/90 flex flex-col items-center justify-center p-6 text-center z-30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-[#00d4aa]" />
          </div>
          <h3 className="font-['Outfit'] font-black text-xl text-white mb-2">Camera is Paused</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Turn your webcam on to track your posture and begin the fitness arena challenge.
          </p>
          <button
            onClick={startCamera}
            className="px-5 py-2.5 rounded-xl bg-[#00d4aa] text-[#0f0f1a] font-black text-xs uppercase tracking-wider hover:opacity-90 cursor-pointer"
          >
            Activate Camera
          </button>
        </div>
      )}
    </div>
  );
};
