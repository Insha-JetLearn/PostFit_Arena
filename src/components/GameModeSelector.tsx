import React from 'react';
import { GameMode } from '../types/fitness';
import { PlayCircle, Zap, ListOrdered, Info } from 'lucide-react';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  disabled?: boolean;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  disabled = false,
}) => {
  const modes: { id: GameMode; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'free_play',
      title: 'Free Play',
      subtitle: 'Unlimited time · Self-paced · Switch freely',
      icon: <PlayCircle className="w-4 h-4" />,
    },
    {
      id: 'challenge_30s',
      title: '30-Sec Challenge',
      subtitle: '30s Blitz · Maximum speed & form · High score',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'routine',
      title: 'Routine Mode',
      subtitle: '5-Exercise Circuit · Guided reps · Full workout',
      icon: <ListOrdered className="w-4 h-4" />,
    },
  ];

  return (
    <div id="modes" className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Workout Mode</span>
          <span className="text-xs text-slate-400">· Select challenge structure</span>
        </div>
        {disabled && (
          <span className="text-xs text-amber-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Pause or end session to switch modes
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-[#16162a]/80 backdrop-blur-sm rounded-xl border border-white/10">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              disabled={disabled}
              onClick={() => onSelectMode(mode.id)}
              className={`flex items-start gap-3 p-3 text-left rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] ${
                isActive
                  ? 'bg-gradient-to-r from-[#00d4aa]/20 to-[#7c3aed]/20 border border-[#00d4aa]/60 text-white shadow-[0_0_15px_rgba(0,212,170,0.15)]'
                  : 'bg-white/[0.02] border border-white/5 text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isActive ? 'bg-[#00d4aa] text-[#0f0f1a]' : 'bg-white/5 text-slate-400'
                }`}
              >
                {mode.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-['Outfit'] font-bold text-sm text-white tracking-wide truncate">
                  {mode.title}
                </span>
                <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {mode.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
