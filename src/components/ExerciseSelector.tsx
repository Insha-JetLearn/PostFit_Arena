import React from 'react';
import { ExerciseType } from '../types/fitness';
import { EXERCISE_DEFINITIONS } from '../utils/poseEngines';
import { Dumbbell, CheckCircle2 } from 'lucide-react';

interface ExerciseSelectorProps {
  currentExercise: ExerciseType;
  onSelectExercise: (type: ExerciseType) => void;
  repsMap: Record<ExerciseType, number>;
  disabled?: boolean;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  currentExercise,
  onSelectExercise,
  repsMap,
  disabled = false,
}) => {
  const exercises: ExerciseType[] = ['squats', 'jumps', 'pushups', 'lunges', 'jumping_jacks'];

  return (
    <div id="exercises" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Exercise Selection</span>
          <span className="text-xs text-slate-400">· Real-time MoveNet posture tracking</span>
        </div>
        <div className="text-xs text-slate-400">
          Total Reps: <strong className="text-[#00d4aa] tabular-nums">{Object.values(repsMap).reduce((a, b) => a + b, 0)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {exercises.map((type) => {
          const def = EXERCISE_DEFINITIONS[type];
          const isSelected = currentExercise === type;
          const completedReps = repsMap[type] || 0;

          return (
            <button
              key={type}
              disabled={disabled}
              onClick={() => onSelectExercise(type)}
              className={`group relative flex flex-col text-left rounded-xl overflow-hidden transition-all duration-300 border cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] ${
                isSelected
                  ? 'bg-[#1e1b4b]/60 border-[#00d4aa] shadow-[0_0_20px_rgba(0,212,170,0.25)] ring-1 ring-[#00d4aa]/50 scale-[1.02]'
                  : 'bg-[#16162a]/80 border-white/10 hover:border-white/30 hover:bg-[#1a1a36]'
              }`}
            >
              {/* Top Image Preview */}
              <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={def.image}
                  alt={def.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG placeholder if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback styling container */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-black/20 pointer-events-none" />

                {/* Completed reps badge */}
                {completedReps > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-[#00d4aa]/40 text-[#00d4aa] text-[10px] font-bold tabular-nums">
                    <CheckCircle2 className="w-3 h-3 text-[#00d4aa]" />
                    <span>{completedReps} reps</span>
                  </div>
                )}
              </div>

              {/* Content info */}
              <div className="p-3 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-['Outfit'] font-black text-sm text-white tracking-wide">
                      {def.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#00d4aa] shadow-[0_0_8px_#00d4aa]" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block line-clamp-1">
                    {def.category}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-[#7c3aed]" />
                    <span className="truncate max-w-[100px]">{def.targetMuscles[0]}</span>
                  </div>
                  <span className={isSelected ? 'text-[#00d4aa] font-semibold' : 'text-slate-400'}>
                    {isSelected ? 'Active' : 'Select'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
