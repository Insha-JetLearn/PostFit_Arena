import React from 'react';
import { WorkoutState } from '../types/fitness';
import { Play, Pause, RotateCcw, Square, Camera, CameraOff, FlipHorizontal, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

interface WorkoutControlsProps {
  workoutState: WorkoutState;
  isCameraActive: boolean;
  isModelReady: boolean;
  cameraError: string | null;
  isMirrored: boolean;
  isMuted: boolean;
  onStart: () => void;
  onPauseResume: () => void;
  onRestart: () => void;
  onEnd: () => void;
  onToggleCamera: () => void;
  onToggleMirror: () => void;
  onToggleMute: () => void;
}

export const WorkoutControls: React.FC<WorkoutControlsProps> = ({
  workoutState,
  isCameraActive,
  isModelReady,
  cameraError,
  isMirrored,
  isMuted,
  onStart,
  onPauseResume,
  onRestart,
  onEnd,
  onToggleCamera,
  onToggleMirror,
  onToggleMute,
}) => {
  const isRunning = workoutState === 'active';
  const isPaused = workoutState === 'paused';
  const isIdle = workoutState === 'idle' || workoutState === 'completed';

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#16162a]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
      {/* Primary Workout Playback Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {isIdle ? (
          <button
            onClick={onStart}
            disabled={!isModelReady || !!cameraError}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-['Outfit'] font-black text-sm uppercase tracking-wider text-[#0f0f1a] bg-gradient-to-r from-[#00d4aa] to-[#00b38f] hover:opacity-95 shadow-[0_0_20px_rgba(0,212,170,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Workout</span>
          </button>
        ) : (
          <>
            <button
              onClick={onPauseResume}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-['Outfit'] font-bold text-sm tracking-wide transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] ${
                isPaused
                  ? 'bg-[#00d4aa] text-[#0f0f1a] shadow-[0_0_15px_rgba(0,212,170,0.35)]'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={onRestart}
              title="Reset score and workout session"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              onClick={onEnd}
              title="Finish workout and view summary"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>End Workout</span>
            </button>
          </>
        )}
      </div>

      {/* Secondary Hardware & Preference Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {cameraError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[200px]">Camera blocked</span>
          </div>
        )}

        {/* Toggle Camera Stream */}
        <button
          onClick={onToggleCamera}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] ${
            isCameraActive
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title={isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isCameraActive ? 'Camera On' : 'Camera Off'}</span>
        </button>

        {/* Mirror Mode */}
        <button
          onClick={onToggleMirror}
          className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] ${
            isMirrored
              ? 'bg-[#7c3aed]/20 border-[#7c3aed]/40 text-[#c4b5fd]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title={isMirrored ? 'Disable Mirroring' : 'Enable Mirroring (Recommended)'}
          aria-label="Toggle Mirror View"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>

        {/* Sound FX */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] ${
            !isMuted
              ? 'bg-[#00d4aa]/15 border-[#00d4aa]/30 text-[#00d4aa]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
