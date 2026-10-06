import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { calculatePlates } from '../utils/calculations';
import { X, Minus, Plus } from 'lucide-react';

export const PlateCalculatorModal: React.FC = () => {
  const { plateCalcOpen, setPlateCalcOpen, settings } = useWorkout();
  const [targetWeight, setTargetWeight] = useState<number>(settings.unit === 'kg' ? 80 : 185);
  const [barWeight, setBarWeight] = useState<number>(settings.unit === 'kg' ? 20 : 45);

  if (!plateCalcOpen) return null;

  const result = calculatePlates(targetWeight, settings.unit, barWeight);

  const getPlateColor = (weight: number) => {
    if (settings.unit === 'kg') {
      if (weight >= 25) return 'bg-red-600 text-white border-red-500';
      if (weight >= 20) return 'bg-[#4D8DFF] text-white border-blue-400';
      if (weight >= 15) return 'bg-amber-400 text-[#0B0D10] border-amber-300';
      if (weight >= 10) return 'bg-[#B7FF00] text-[#0B0D10] border-[#B7FF00]';
      if (weight >= 5) return 'bg-slate-200 text-slate-900 border-white';
      if (weight >= 2.5) return 'bg-[#1C2026] text-white border-slate-600';
      return 'bg-zinc-500 text-white border-zinc-400';
    } else {
      if (weight >= 45) return 'bg-[#4D8DFF] text-white border-blue-400';
      if (weight >= 35) return 'bg-amber-400 text-[#0B0D10] border-amber-300';
      if (weight >= 25) return 'bg-[#B7FF00] text-[#0B0D10] border-[#B7FF00]';
      if (weight >= 10) return 'bg-slate-200 text-slate-900 border-white';
      if (weight >= 5) return 'bg-[#1C2026] text-white border-slate-600';
      return 'bg-zinc-500 text-white border-zinc-400';
    }
  };

  const getPlateHeight = (weight: number) => {
    if (settings.unit === 'kg') {
      if (weight >= 20) return 'h-24';
      if (weight >= 15) return 'h-20';
      if (weight >= 10) return 'h-16';
      if (weight >= 5) return 'h-12';
      return 'h-9';
    } else {
      if (weight >= 45) return 'h-24';
      if (weight >= 35) return 'h-20';
      if (weight >= 25) return 'h-16';
      if (weight >= 10) return 'h-12';
      return 'h-9';
    }
  };

  const adjustWeight = (delta: number) => {
    setTargetWeight(prev => Math.max(barWeight, Math.round((prev + delta) * 10) / 10));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Barbell Plate Calculator</h2>
            <p className="text-xs text-[#8A9099] mt-0.5">Plates needed per side of the barbell</p>
          </div>
          <button
            onClick={() => setPlateCalcOpen(false)}
            className="w-8 h-8 rounded-xl bg-[#1C2026] hover:bg-white/10 flex items-center justify-center text-[#8A9099] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Weight Controls */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">
            Total Target Load ({settings.unit.toUpperCase()})
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustWeight(settings.unit === 'kg' ? -2.5 : -5)}
              className="w-12 h-12 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white flex items-center justify-center font-bold text-lg cursor-pointer border border-white/5"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              step={settings.unit === 'kg' ? '2.5' : '5'}
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value) || 0)}
              className="flex-1 h-12 text-center font-mono font-black text-2xl bg-[#0B0D10] border border-white/[0.08] rounded-xl text-white focus:border-[#B7FF00] focus:outline-none"
            />
            <button
              onClick={() => adjustWeight(settings.unit === 'kg' ? 2.5 : 5)}
              className="w-12 h-12 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white flex items-center justify-center font-bold text-lg cursor-pointer border border-white/5"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {(settings.unit === 'kg' ? [40, 60, 80, 100, 120, 140] : [95, 135, 185, 225, 275, 315]).map(val => (
              <button
                key={val}
                onClick={() => setTargetWeight(val)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                  targetWeight === val 
                    ? 'bg-[#B7FF00] border-[#B7FF00] text-[#0B0D10] shadow-neon-sm' 
                    : 'bg-[#1C2026] border-white/5 text-[#8A9099] hover:text-white'
                }`}
              >
                {val} {settings.unit.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Weight Selection */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
          <span className="text-[#8A9099]">Barbell weight:</span>
          <div className="flex items-center gap-1.5">
            {(settings.unit === 'kg' ? [20, 15] : [45, 35]).map(b => (
              <button
                key={b}
                onClick={() => setBarWeight(b)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  barWeight === b ? 'bg-[#B7FF00] text-[#0B0D10]' : 'bg-[#1C2026] text-[#8A9099] hover:text-white'
                }`}
              >
                {b} {settings.unit.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Sleeve Visual */}
        <div className="bg-[#0B0D10] border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center">
          <span className="text-[10px] font-mono text-[#8A9099] uppercase tracking-widest mb-3 font-bold">
            SLEEVE LOAD: {result.weightPerSide} {settings.unit.toUpperCase()} / SIDE
          </span>

          <div className="relative w-full h-28 flex items-center justify-center">
            <div className="absolute w-full h-4 bg-slate-700/80 rounded-sm"></div>
            <div className="absolute left-6 w-3.5 h-20 bg-slate-600 rounded-sm z-10 shadow-md"></div>

            <div className="relative flex items-center gap-1 pl-12 z-20">
              {result.plates.length === 0 ? (
                <span className="text-xs text-[#8A9099] italic">Empty Bar</span>
              ) : (
                result.plates.flatMap((p) =>
                  Array.from({ length: p.countPerSide }, (_, i) => (
                    <div
                      key={`${p.plateWeight}_${i}`}
                      className={`w-6.5 ${getPlateHeight(p.plateWeight)} ${getPlateColor(p.plateWeight)} rounded-md border flex flex-col items-center justify-center font-mono text-[10px] font-black shadow-lg`}
                    >
                      <span className="-rotate-90 whitespace-nowrap">{p.plateWeight}</span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {result.remainder > 0 && (
            <p className="text-xs text-amber-400 mt-2 font-mono">
              Remainder: {result.remainder} {settings.unit}
            </p>
          )}
        </div>

        {/* Breakdown List */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Per Side Requirements:</span>
          {result.plates.length === 0 ? (
            <p className="text-xs text-[#8A9099]">Just lift the barbell ({barWeight} {settings.unit.toUpperCase()})</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {result.plates.map((p) => (
                <div
                  key={p.plateWeight}
                  className="bg-[#1C2026] border border-white/5 rounded-xl p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${getPlateColor(p.plateWeight)}`} />
                    <span className="font-mono text-sm font-bold text-white">
                      {p.plateWeight} {settings.unit.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#B7FF00]">
                    × {p.countPerSide}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setPlateCalcOpen(false)}
          className="w-full py-3 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] font-black text-sm transition-all cursor-pointer shadow-neon-sm"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
