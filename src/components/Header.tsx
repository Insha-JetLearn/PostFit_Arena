import React from 'react';
import { Activity, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onQuickStart: () => void;
  isWorkoutActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleMute,
  onNavigateSection,
  onQuickStart,
  isWorkoutActive,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f0f1a]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="#arena"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection?.('arena');
          }}
          className="flex items-center gap-2.5 text-white whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] rounded"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#7c3aed] flex items-center justify-center shadow-[0_0_15px_rgba(0,212,170,0.4)] group-hover:shadow-[0_0_20px_rgba(0,212,170,0.6)] transition-shadow">
            <Activity className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#00d4aa]">
              POSEFIT ARENA
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <button
            onClick={() => onNavigateSection?.('arena')}
            className="hover:text-[#00d4aa] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Arena
          </button>
          <button
            onClick={() => onNavigateSection?.('modes')}
            className="hover:text-[#00d4aa] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Game Modes
          </button>
          <button
            onClick={() => onNavigateSection?.('exercises')}
            className="hover:text-[#00d4aa] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Exercises
          </button>
          <button
            onClick={() => onNavigateSection?.('guide')}
            className="hover:text-[#00d4aa] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Form Guide
          </button>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00d4aa]" />
            <span>100% Private In-Browser AI</span>
          </div>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#00d4aa]" />}
          </button>

          <button
            onClick={onQuickStart}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] ${
              isWorkoutActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-[#00d4aa] to-[#00b38f] text-[#0f0f1a] font-black hover:opacity-95 shadow-[0_0_15px_rgba(0,212,170,0.35)]'
            }`}
          >
            {isWorkoutActive ? 'End Workout' : 'Start Workout'}
          </button>
        </div>
      </div>
    </header>
  );
};
