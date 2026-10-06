import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { formatSeconds } from '../utils/calculations';
import { Play, Pause, RotateCcw, X, Plus, BellRing } from 'lucide-react';

export const RestTimerBar: React.FC = () => {
  const { 
    restTimer, 
    startRestTimer, 
    pauseRestTimer, 
    resetRestTimer, 
    adjustRestTimer, 
    dismissRestTimer,
    timerNotification,
    dismissTimerNotification
  } = useWorkout();

  // If timer notification is present, show notification banner
  if (timerNotification) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-45 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="bg-[#15181D] border border-[#B7FF00]/60 shadow-neon-glow rounded-2xl p-4 backdrop-blur-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B7FF00]/10 border border-[#B7FF00]/30 flex items-center justify-center text-[#B7FF00]">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white tracking-tight">Rest Finished!</h4>
              <p className="text-xs text-[#B7FF00] font-semibold">{timerNotification}</p>
            </div>
          </div>
          <button
            onClick={dismissTimerNotification}
            className="px-3 py-1.5 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] text-xs font-bold transition-all cursor-pointer"
          >
            Start Set
          </button>
        </div>
      </div>
    );
  }

  const isVisible = restTimer.isActive || (restTimer.timeRemaining > 0 && restTimer.timeRemaining < restTimer.totalDuration);
  if (!isVisible) return null;

  const progress = restTimer.totalDuration > 0
    ? Math.min(100, Math.max(0, ((restTimer.totalDuration - restTimer.timeRemaining) / restTimer.totalDuration) * 100))
    : 0;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-45 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#15181D]/95 border border-[#B7FF00]/30 shadow-2xl shadow-black/80 rounded-2xl p-3.5 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          {/* Progress ring & time */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#1C2026]"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#B7FF00] transition-all duration-300"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-[11px] font-extrabold text-white tabular-nums">
                {Math.ceil(restTimer.timeRemaining)}s
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-[#B7FF00] uppercase tracking-wider">
                  REST TIMER
                </span>
                {restTimer.exerciseName && (
                  <span className="text-xs text-[#8A9099] truncate max-w-[120px]">
                    · {restTimer.exerciseName}
                  </span>
                )}
              </div>
              <div className="font-mono text-lg font-black text-white tabular-nums tracking-tight">
                {formatSeconds(restTimer.timeRemaining)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjustRestTimer(15)}
              title="Add 15 seconds"
              className="h-9 px-2.5 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white text-xs font-mono font-bold flex items-center gap-0.5 transition-colors cursor-pointer border border-white/5"
            >
              <Plus className="w-3 h-3 text-[#B7FF00]" />
              15s
            </button>

            {restTimer.isActive ? (
              <button
                onClick={pauseRestTimer}
                title="Pause"
                className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => startRestTimer(restTimer.timeRemaining)}
                title="Resume"
                className="w-9 h-9 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] flex items-center justify-center font-bold transition-all shadow-neon-sm cursor-pointer"
              >
                <Play className="w-4 h-4 ml-0.5 fill-[#0B0D10]" />
              </button>
            )}

            <button
              onClick={resetRestTimer}
              title="Reset"
              className="w-9 h-9 rounded-xl bg-[#1C2026] hover:bg-white/10 text-[#8A9099] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={dismissRestTimer}
              title="Close Timer"
              className="w-9 h-9 rounded-xl bg-transparent hover:bg-white/10 text-[#8A9099] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
