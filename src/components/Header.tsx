import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Volume2, VolumeX, Calculator, Dumbbell, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    settings, 
    updateSettings, 
    setPlateCalcOpen,
    activeWorkout 
  } = useWorkout();

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleUnit = () => {
    updateSettings({ unit: settings.unit === 'kg' ? 'lbs' : 'kg' });
  };

  const getInitials = (fullName: string) => {
    const parts = (fullName || 'Pritam Sahu').trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase() || 'PS';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0D10]/95 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand Zone */}
        <button 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#1C2026] border border-white/10 flex items-center justify-center text-[#B7FF00] group-hover:border-[#B7FF00]/40 transition-colors shadow-neon-sm">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
            SMART GYM
            <span className="text-[#B7FF00] font-mono text-xs px-1.5 py-0.5 rounded-md bg-[#B7FF00]/10 border border-[#B7FF00]/30 font-bold">
              LOG
            </span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-[#8A9099]">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors hover:text-white cursor-pointer ${activeTab === 'home' ? 'text-[#B7FF00] font-bold' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`transition-colors hover:text-white relative cursor-pointer ${activeTab === 'workout' ? 'text-[#B7FF00] font-bold' : ''}`}
          >
            Workout
            {activeWorkout && (
              <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#B7FF00] shadow-neon-sm animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`transition-colors hover:text-white cursor-pointer ${activeTab === 'progress' ? 'text-[#B7FF00] font-bold' : ''}`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors hover:text-white cursor-pointer ${activeTab === 'history' ? 'text-[#B7FF00] font-bold' : ''}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`transition-colors hover:text-white cursor-pointer ${activeTab === 'profile' ? 'text-[#B7FF00] font-bold' : ''}`}
          >
            Profile
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Plate Calculator Button */}
          <button
            onClick={() => setPlateCalcOpen(true)}
            title="Plate Calculator"
            className="h-8.5 px-2.5 rounded-xl bg-[#15181D] hover:bg-[#1C2026] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-[#B7FF00]" />
            <span className="hidden sm:inline">Plates</span>
          </button>

          {/* Unit Toggle */}
          <button
            onClick={toggleUnit}
            title="Toggle KG / LB"
            className="h-8.5 px-2.5 rounded-xl bg-[#15181D] hover:bg-[#1C2026] border border-white/[0.08] text-white text-xs font-mono font-bold transition-colors cursor-pointer hover:border-[#B7FF00]/40"
          >
            {settings.unit.toUpperCase()}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Timer Sound On' : 'Timer Sound Muted'}
            className="w-8.5 h-8.5 rounded-xl bg-[#15181D] hover:bg-[#1C2026] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#B7FF00]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#8A9099]" />
            )}
          </button>

          {/* Profile Avatar Trigger Button */}
          <button
            onClick={() => setActiveTab('profile')}
            title={`Profile: ${settings.profile.name} (${settings.profile.email || 'pritamkumarsahu7067@gmail.com'})`}
            className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#B7FF00] text-[#0B0D10] border-[#B7FF00] shadow-neon-sm'
                : 'bg-[#1C2026] border-white/10 text-white hover:border-[#B7FF00]/50'
            }`}
          >
            <span className="font-mono text-xs font-extrabold">
              {getInitials(settings.profile.name)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
