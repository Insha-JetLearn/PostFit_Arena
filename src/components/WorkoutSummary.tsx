import React, { useEffect } from 'react';
import { GameMode, ExerciseType } from '../types/fitness';
import { EXERCISE_DEFINITIONS } from '../utils/poseEngines';
import confetti from 'canvas-confetti';
import { Trophy, Award, Zap, Timer, Flame, RotateCcw, X } from 'lucide-react';

interface WorkoutSummaryProps {
  score: number;
  totalReps: number;
  bestStreak: number;
  elapsedSeconds: number;
  estimatedCalories: number;
  gameMode: GameMode;
  repsMap: Record<ExerciseType, number>;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  score,
  totalReps,
  bestStreak,
  elapsedSeconds,
  estimatedCalories,
  gameMode,
  repsMap,
  onPlayAgain,
  onClose,
}) => {
  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d4aa', '#7c3aed', '#f59e0b', '#38bdf8', '#ffffff'],
      });
    } catch (err) {
      console.warn('Confetti launch error:', err);
    }
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  const getModeTitle = () => {
    switch (gameMode) {
      case 'challenge_30s':
        return '30-Second Challenge Summary';
      case 'routine':
        return 'Routine Circuit Completed!';
      default:
        return 'Workout Session Summary';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#16162a] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Neon Ambient Background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00d4aa]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#7c3aed]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close summary"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#00d4aa]/20 to-[#7c3aed]/20 border border-[#00d4aa]/40 mb-3 shadow-[0_0_20px_rgba(0,212,170,0.3)]">
            <Trophy className="w-8 h-8 text-[#00d4aa]" />
          </div>
          <h2 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-white tracking-wide">
            {getModeTitle()}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Excellent effort in the Arena! Your AI performance metrics are ready.
          </p>
        </div>

        {/* High-Level Score Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
              <Award className="w-3.5 h-3.5 text-[#00d4aa]" />
              <span>SCORE</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-white tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>TOTAL REPS</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-white tabular-nums">
              {totalReps}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>BEST STREAK</span>
            </div>
            <div className="font-['Outfit'] font-black text-2xl text-white tabular-nums">
              {bestStreak}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              <span>TIME ACTIVE</span>
            </div>
            <div className="font-['JetBrains_Mono'] font-bold text-lg text-white tabular-nums mt-1">
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Reps Breakdown per Exercise */}
        <div className="bg-black/30 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
            <span>Exercise Breakdown</span>
            <span className="text-[11px] text-slate-400">~{estimatedCalories.toFixed(1)} kcal Burned</span>
          </div>

          <div className="space-y-2">
            {(Object.keys(EXERCISE_DEFINITIONS) as ExerciseType[]).map((exType) => {
              const def = EXERCISE_DEFINITIONS[exType];
              const count = repsMap[exType] || 0;
              const points = count * 10;

              return (
                <div
                  key={exType}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-800 shrink-0">
                      <img src={def.image} alt={def.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-white">{def.name}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-300 tabular-nums">{count} reps</span>
                    <span className="text-[#00d4aa] font-bold tabular-nums">+{points} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-['Outfit'] font-black text-sm uppercase tracking-wider text-[#0f0f1a] bg-gradient-to-r from-[#00d4aa] to-[#00b38f] hover:opacity-95 shadow-[0_0_20px_rgba(0,212,170,0.4)] cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
