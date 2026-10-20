import React from 'react';
import { FloatingNotification } from '../types/fitness';

interface FloatingFeedbackProps {
  notifications: FloatingNotification[];
}

export const FloatingFeedback: React.FC<FloatingFeedbackProps> = ({ notifications }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-25">
      <div className="flex flex-col items-center gap-3">
        {notifications.map((notif) => {
          const isStreak = notif.type === 'streak';
          const isMultiplier = notif.type === 'multiplier';

          return (
            <div
              key={notif.id}
              className={`px-4 py-2 rounded-2xl font-['Outfit'] font-black text-center shadow-2xl transition-all duration-300 animate-bounce ${
                isMultiplier
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-[#7c3aed] text-white text-lg border-2 border-white/40 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                  : isStreak
                  ? 'bg-gradient-to-r from-[#7c3aed] to-[#00d4aa] text-white text-base border border-white/20 shadow-[0_0_20px_rgba(0,212,170,0.5)]'
                  : 'bg-black/85 backdrop-blur-md text-[#00d4aa] text-xl border border-[#00d4aa]/60 shadow-[0_0_20px_rgba(0,212,170,0.4)]'
              }`}
            >
              {notif.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
