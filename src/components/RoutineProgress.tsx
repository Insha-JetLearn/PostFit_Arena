import React from 'react';
import { RoutineStep } from '../types/fitness';
import { EXERCISE_DEFINITIONS } from '../utils/poseEngines';
import { CheckCircle2, ChevronRight, Trophy } from 'lucide-react';

interface RoutineProgressProps {
  steps: RoutineStep[];
  currentStepIndex: number;
  onNextExercise: () => void;
  onSkipExercise: () => void;
}

export const RoutineProgress: React.FC<RoutineProgressProps> = ({
  steps,
  currentStepIndex,
  onNextExercise,
  onSkipExercise,
}) => {
  const currentStep = steps[currentStepIndex];
  const currentDef = currentStep ? EXERCISE_DEFINITIONS[currentStep.exerciseId] : null;

  const totalTargetReps = steps.reduce((sum, s) => sum + s.targetReps, 0);
  const totalCompletedReps = steps.reduce((sum, s) => sum + Math.min(s.completedReps, s.targetReps), 0);
  const overallPercentage = Math.round((totalCompletedReps / (totalTargetReps || 1)) * 100);

  return (
    <div className="w-full bg-[#16162a]/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 sm:p-5 shadow-xl">
      {/* Header with overall percentage */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#00d4aa]" />
          <span className="font-['Outfit'] font-black text-sm text-white uppercase tracking-wider">
            Routine Mode Progress
          </span>
          <span className="text-xs text-slate-400">
            ({currentStepIndex + 1} of {steps.length})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-[#00d4aa] tabular-nums">
            {totalCompletedReps} / {totalTargetReps} Total Target Reps ({overallPercentage}%)
          </span>
        </div>
      </div>

      {/* Routine Overall Progress Bar */}
      <div className="w-full bg-black/40 rounded-full h-2 mb-4 overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#7c3aed] to-[#00d4aa] transition-all duration-300 rounded-full"
          style={{ width: `${overallPercentage}%` }}
        />
      </div>

      {/* 5-Step Exercise Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
        {steps.map((step, idx) => {
          const def = EXERCISE_DEFINITIONS[step.exerciseId];
          const isDone = step.completedReps >= step.targetReps || step.isCompleted;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.exerciseId}
              className={`flex flex-col p-2.5 rounded-xl border transition-all text-left ${
                isCurrent
                  ? 'bg-[#7c3aed]/20 border-[#00d4aa] shadow-[0_0_12px_rgba(0,212,170,0.3)]'
                  : isDone
                  ? 'bg-white/[0.04] border-[#00d4aa]/30 text-slate-300'
                  : 'bg-white/[0.01] border-white/5 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  0{idx + 1}. {def.name}
                </span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#00d4aa]" />}
              </div>
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className={isCurrent ? 'text-white font-bold' : 'text-slate-400'}>
                  {step.completedReps} / {step.targetReps}
                </span>
                <span className="text-[10px] text-slate-400">REPS</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Action Bar */}
      {currentStep && currentDef && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
              <img src={currentDef.image} alt={currentDef.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Current Routine Goal</div>
              <div className="font-['Outfit'] font-bold text-sm text-white">
                Complete {currentStep.targetReps} {currentDef.name}{' '}
                <span className="text-[#00d4aa] tabular-nums font-mono">
                  ({currentStep.completedReps} done)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSkipExercise}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={onNextExercise}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-[#0f0f1a] bg-[#00d4aa] hover:bg-[#00d4aa]/90 transition-colors cursor-pointer shadow-md"
            >
              <span>Next Exercise</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
