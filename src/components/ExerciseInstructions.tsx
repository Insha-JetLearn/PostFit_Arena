import React from 'react';
import { ExerciseDefinition } from '../types/fitness';
import { Target, CheckCircle, Lightbulb } from 'lucide-react';

interface ExerciseInstructionsProps {
  exercise: ExerciseDefinition;
}

export const ExerciseInstructions: React.FC<ExerciseInstructionsProps> = ({ exercise }) => {
  return (
    <div id="guide" className="w-full bg-[#16162a]/90 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Exercise Visual & Target Muscles */}
        <div className="lg:w-1/3 flex flex-col gap-3">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-md">
            <img
              src={exercise.image}
              alt={exercise.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
              <span className="font-['Outfit'] font-black text-lg text-white">
                {exercise.name}
              </span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
              <Target className="w-3.5 h-3.5 text-[#00d4aa]" />
              <span>Target Muscle Groups</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
              {exercise.targetMuscles.map((muscle, idx) => (
                <span key={muscle} className="text-slate-300">
                  {muscle}
                  {idx < exercise.targetMuscles.length - 1 && <span className="text-slate-500 mx-1">·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Step-by-Step Instructions & Pro Form Tips */}
        <div className="lg:w-2/3 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-['Outfit'] font-black text-base text-white tracking-wide">
                Exercise Execution & Tracking
              </h4>
              <span className="text-xs text-slate-400">{exercise.category}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {exercise.description}
            </p>

            <div className="space-y-2 mb-4">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-md bg-[#00d4aa]/15 border border-[#00d4aa]/30 flex items-center justify-center shrink-0 text-[#00d4aa] font-bold text-[11px] mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tracking Pro Tips */}
          <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#00d4aa]/10 border border-[#7c3aed]/20 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#00d4aa] mb-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Camera Setup Pro Tips</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {exercise.proTips.map((tip, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-[#00d4aa] shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
