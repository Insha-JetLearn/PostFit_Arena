import React from 'react';
import { Flame, Zap, Award, Timer, Sparkles } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  totalReps: number;
  currentStreak: number;
  bestStreak: number;
  multiplier: number;
  elapsedSeconds: number;
  estimatedCalories: number;
  exerciseName?: string;
  gameMode?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  totalReps,
  currentStreak,
  bestStreak,
  multiplier,
  elapsedSeconds,
  estimatedCalories,
  exerciseName,
  gameMode,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Streak progress to next tier: 0->5 (for 2x), 5->10 (for 3x)
  let streakProgress = 0;
  let nextGoal = 5;
  if (currentStreak < 5) {
    streakProgress = (currentStreak / 5) * 100;
    nextGoal = 5;
  } else if (currentStreak < 10) {
    streakProgress = ((currentStreak - 5) / 5) * 100;
    nextGoal = 10;
  } else {
    streakProgress = 100;
    nextGoal = 10;
  }

  return (
    <div className="w-full bg-[#16162a]/90 backdrop-blur-md rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Background ambient neon glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#00d4aa]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {/* Total Score */}
        <div className="flex flex-col bg-white/[0.03] border border-white/5 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span className="uppercase tracking-wider">Total Score</span>
            <Sparkles className="w-3.5 h-3.5 text-[#00d4aa]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-['Outfit'] font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
              {score.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#00d4aa]">PTS</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {multiplier > 1 ? (
              <span className="text-[#00d4aa] font-semibold">{multiplier}x Active Multiplier!</span>
            ) : (
              <span>10 pts per standard rep</span>
            )}
          </div>
        </div>

        {/* Total Repetitions */}
        <div className="flex flex-col bg-white/[0.03] border border-white/5 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span className="uppercase tracking-wider">Repetitions</span>
            <Award className="w-3.5 h-3.5 text-[#7c3aed]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-['Outfit'] font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
              {totalReps}
            </span>
            <span className="text-xs font-bold text-slate-400">REPS</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {exerciseName ? `Current: ${exerciseName}` : 'All completed exercises'}
          </div>
        </div>

        {/* Current Streak & Multiplier */}
        <div
          className={`flex flex-col rounded-xl p-3 sm:p-4 transition-all duration-300 border ${
            multiplier >= 3
              ? 'bg-gradient-to-br from-[#7c3aed]/25 via-amber-500/15 to-[#00d4aa]/25 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              : multiplier >= 2
              ? 'bg-[#7c3aed]/15 border-[#7c3aed]/40'
              : 'bg-white/[0.03] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="uppercase tracking-wider">Combo Streak</span>
              {multiplier > 1 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#00d4aa] text-[#0f0f1a]">
                  {multiplier}x
                </span>
              )}
            </div>
            {multiplier >= 3 ? (
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-[#00d4aa]" />
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-['Outfit'] font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
              {currentStreak}
            </span>
            <span className="text-xs text-slate-400">
              (Best: <strong className="text-white tabular-nums">{bestStreak}</strong>)
            </span>
          </div>

          {/* Streak bar */}
          <div className="w-full bg-black/40 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                multiplier >= 3 ? 'bg-gradient-to-r from-amber-400 to-[#00d4aa]' : 'bg-[#00d4aa]'
              }`}
              style={{ width: `${streakProgress}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>{currentStreak >= 10 ? 'MAX COMBO 3x' : `Next tier at ${nextGoal}`}</span>
            <span>4s timer limit</span>
          </div>
        </div>

        {/* Timer & Burn */}
        <div className="flex flex-col bg-white/[0.03] border border-white/5 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span className="uppercase tracking-wider">Session Time</span>
            <Timer className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-['JetBrains_Mono'] font-bold text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>~{estimatedCalories.toFixed(1)} kcal</span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">{gameMode || 'Free Play'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
