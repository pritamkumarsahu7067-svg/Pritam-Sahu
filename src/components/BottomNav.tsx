import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Home, Dumbbell, TrendingUp, Calendar, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeWorkout } = useWorkout();

  const navItems = [
    { id: 'home' as const, label: 'HOME', icon: Home },
    { id: 'workout' as const, label: 'WORKOUT', icon: Dumbbell, hasBadge: !!activeWorkout },
    { id: 'progress' as const, label: 'PROGRESS', icon: TrendingUp },
    { id: 'history' as const, label: 'HISTORY', icon: Calendar },
    { id: 'profile' as const, label: 'PROFILE', icon: User },
  ];

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-40 max-w-lg mx-auto md:hidden">
      <div className="bg-[#15181D]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl rounded-2xl p-1.5 grid grid-cols-5 items-center">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[48px] py-1 rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-[#1C2026] text-[#B7FF00] shadow-sm' 
                  : 'text-[#8A9099] hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`} 
                />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#B7FF00] shadow-neon-sm ring-2 ring-[#15181D] animate-pulse" />
                )}
              </div>
              <span className={`text-[9px] mt-1 font-mono tracking-wider font-bold transition-colors ${
                isActive ? 'text-[#B7FF00]' : 'text-[#8A9099]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
