import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { calculate1RM, filterWorkoutsByTimeRange } from '../utils/calculations';
import { TimeRangeFilter } from '../types/workout';
import { 
  Trophy, 
  TrendingUp, 
  Dumbbell, 
  Award, 
  Flame, 
  Activity, 
  Calendar, 
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { prs, history, settings, timeRangeFilter, setTimeRangeFilter } = useWorkout();

  // State for interactive 1RM calculator
  const [calcWeight, setCalcWeight] = useState<number>(settings.unit === 'kg' ? 80 : 185);
  const [calcReps, setCalcReps] = useState<number>(8);

  // Exercise selection for drill-down charts
  const prList = Object.values(prs);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(
    prList.length > 0 ? prList[0].exerciseName : 'Barbell Bench Press'
  );

  const estimated1RM = calculate1RM(calcWeight, calcReps);

  // Filter workouts by time range
  const filteredWorkouts = filterWorkoutsByTimeRange(history, timeRangeFilter);

  // Filtered volume
  const filteredVolume = filteredWorkouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0);

  interface HistoryPoint {
    date: string;
    fullDate: string;
    weight: number;
    reps: number;
    volume: number;
    workoutTitle: string;
  }

  // Extract progression points for the selected exercise across workouts
  const exerciseHistoryPoints: HistoryPoint[] = filteredWorkouts
    .map((w): HistoryPoint | null => {
      const match = w.exercises.find(e => e.name.toLowerCase() === selectedExerciseName.toLowerCase());
      if (!match) return null;
      // find highest weight completed set
      let maxW = 0;
      let maxR = 0;
      match.sets.forEach(s => {
        if (s.completed && typeof s.weight === 'number' && typeof s.reps === 'number') {
          if (s.weight > maxW || (s.weight === maxW && s.reps > maxR)) {
            maxW = s.weight;
            maxR = s.reps;
          }
        }
      });
      if (maxW === 0) return null;
      return {
        date: new Date(w.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        fullDate: w.date,
        weight: maxW,
        reps: maxR,
        volume: maxW * maxR,
        workoutTitle: w.title
      };
    })
    .filter((p): p is HistoryPoint => p !== null)
    .reverse(); // chronological

  const maxHistWeight = Math.max(...exerciseHistoryPoints.map(p => p.weight), 100);
  const maxHistReps = Math.max(...exerciseHistoryPoints.map(p => p.reps), 12);
  const maxHistVol = Math.max(...filteredWorkouts.map(w => w.totalVolume || 0), 2000);

  // Percentages table of 1RM
  const percentages = [
    { pct: 100, label: '1 Rep Max (True Limit)', weight: Math.round(estimated1RM) },
    { pct: 90, label: '3-4 Reps (Heavy Strength)', weight: Math.round(estimated1RM * 0.90) },
    { pct: 80, label: '7-8 Reps (Hypertrophy Target)', weight: Math.round(estimated1RM * 0.80) },
    { pct: 70, label: '10-12 Reps (Endurance & Pump)', weight: Math.round(estimated1RM * 0.70) },
  ];

  const filterOptions: { id: TimeRangeFilter; label: string }[] = [
    { id: '7D', label: '7 DAYS' },
    { id: '30D', label: '30 DAYS' },
    { id: '3M', label: '3 MONTHS' },
    { id: '1Y', label: '1 YEAR' },
    { id: 'ALL', label: 'ALL TIME' },
  ];

  return (
    <div className="space-y-6 pb-28 md:pb-14 max-w-4xl mx-auto">
      {/* Title & Time Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#B7FF00] uppercase tracking-widest block mb-1">
            ANALYTICS & METRICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            PROGRESSION ENGINE
          </h1>
          <p className="text-xs text-[#8A9099] mt-0.5 font-medium">
            Track strength benchmarks, volume progression, and personal records.
          </p>
        </div>

        {/* Time Range Filter Bar */}
        <div className="flex items-center gap-1 bg-[#15181D] border border-white/[0.08] p-1 rounded-2xl overflow-x-auto scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTimeRangeFilter(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                timeRangeFilter === opt.id
                  ? 'bg-[#B7FF00] text-[#0B0D10] shadow-neon-sm'
                  : 'text-[#8A9099] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Weekly Workouts */}
        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Weekly Workouts</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums">
              {filteredWorkouts.length}
            </h3>
            <span className="text-xs font-mono font-bold text-[#4D8DFF]">
              IN RANGE
            </span>
          </div>
        </div>

        {/* Training Volume */}
        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Training Volume</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums">
              {filteredVolume > 99999 ? `${Math.round(filteredVolume / 1000)}k` : filteredVolume.toLocaleString()}
            </h3>
            <span className="text-xs font-mono font-bold text-[#8A9099]">
              {settings.unit.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Workout Streak */}
        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Workout Streak</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums flex items-center gap-1">
              {history.length > 0 ? 3 : 0} <span className="text-xl">🔥</span>
            </h3>
            <span className="text-xs font-mono font-bold text-[#B7FF00]">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Personal Records</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums flex items-center gap-1">
              {prList.length}
            </h3>
            <span className="text-xs font-mono font-bold text-[#8B5CF6]">
              SMASHED
            </span>
          </div>
        </div>
      </div>

      {/* Chart 1: Training Volume Progression */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#B7FF00]" />
              <span>TRAINING VOLUME PROGRESSION</span>
            </h2>
            <p className="text-xs text-[#8A9099] mt-0.5">
              Total tonnage lifted across sessions in {timeRangeFilter}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#B7FF00] bg-[#B7FF00]/10 px-2.5 py-1 rounded-lg">
            {filteredVolume.toLocaleString()} {settings.unit.toUpperCase()}
          </span>
        </div>

        {filteredWorkouts.length === 0 ? (
          <div className="py-12 text-center text-[#8A9099] text-xs font-mono">
            No session data recorded in this timeframe.
          </div>
        ) : (
          <div className="h-44 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-1">
            {filteredWorkouts.slice(-10).map((w) => {
              const heightPct = Math.max(15, Math.min(100, Math.round(((w.totalVolume || 0) / maxHistVol) * 100)));
              const dateLabel = new Date(w.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });

              return (
                <div key={w.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[9px] font-mono text-[#B7FF00] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    {Math.round((w.totalVolume || 0) / 1000)}k
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-[#1C2026] group-hover:bg-[#B7FF00] rounded-t-xl transition-all duration-300 shadow-sm"
                  />
                  <span className="text-[10px] font-mono text-[#8A9099] font-bold">
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart 2: Exercise Weight & Reps Progression */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#4D8DFF]" />
              <span>WEIGHT & REPS PROGRESSION</span>
            </h2>
            <p className="text-xs text-[#8A9099] mt-0.5">
              Specific exercise progressive overload history
            </p>
          </div>

          {/* Exercise Selector Dropdown */}
          <select
            value={selectedExerciseName}
            onChange={(e) => setSelectedExerciseName(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0B0D10] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#B7FF00]"
          >
            {prList.map((pr) => (
              <option key={pr.exerciseName} value={pr.exerciseName}>
                {pr.exerciseName}
              </option>
            ))}
            <option value="Barbell Bench Press">Barbell Bench Press</option>
            <option value="Barbell Back Squat">Barbell Back Squat</option>
            <option value="Conventional Deadlift">Conventional Deadlift</option>
          </select>
        </div>

        {/* Dual Bar Charts: Weight (Lime) & Reps (Blue) */}
        {exerciseHistoryPoints.length === 0 ? (
          <div className="py-12 text-center text-[#8A9099] text-xs font-mono">
            No history points logged for {selectedExerciseName} yet. Complete a workout to see chart.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Weight Progression Chart */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8A9099] mb-1">
                <span>PEAK WEIGHT ({settings.unit.toUpperCase()})</span>
                <span className="text-[#B7FF00]">PROGRESSIVE OVERLOAD</span>
              </div>
              <div className="h-32 flex items-end gap-2 pt-4 px-1">
                {exerciseHistoryPoints.map((pt, idx) => {
                  const h = Math.max(20, Math.min(100, Math.round((pt.weight / maxHistWeight) * 100)));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-black text-white">
                        {pt.weight}
                      </span>
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full bg-[#B7FF00] rounded-t-lg transition-all shadow-neon-sm"
                      />
                      <span className="text-[9px] font-mono text-[#8A9099]">
                        {pt.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reps Progression Chart */}
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8A9099] mb-1">
                <span>REPS ACHIEVED AT PEAK LOAD</span>
                <span className="text-[#4D8DFF]">STRENGTH ENDURANCE</span>
              </div>
              <div className="h-28 flex items-end gap-2 pt-4 px-1">
                {exerciseHistoryPoints.map((pt, idx) => {
                  const h = Math.max(20, Math.min(100, Math.round((pt.reps / maxHistReps) * 100)));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono font-black text-white">
                        {pt.reps}r
                      </span>
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full bg-[#4D8DFF] rounded-t-lg transition-all shadow-blue-glow"
                      />
                      <span className="text-[9px] font-mono text-[#8A9099]">
                        {pt.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attractive PR Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#B7FF00]" />
            <span>ALL PERSONAL RECORDS</span>
          </h2>
          <span className="text-xs text-[#8A9099] font-mono">{prList.length} Total Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prList.map((pr) => (
            <div
              key={pr.exerciseName}
              className="bg-[#15181D] border border-white/[0.08] hover:border-[#B7FF00]/40 rounded-[20px] p-5 flex flex-col justify-between transition-all group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#B7FF00] bg-[#B7FF00]/10 px-2 py-0.5 rounded uppercase">
                    NEW PERSONAL RECORD
                  </span>
                  <Award className="w-4 h-4 text-[#B7FF00]" />
                </div>

                <h3 className="text-base font-black text-white mt-2.5 uppercase tracking-tight">
                  {pr.exerciseName}
                </h3>

                <div className="mt-3 flex items-baseline gap-2 font-mono">
                  <span className="text-2xl font-black text-white tabular-nums tracking-tight">
                    {pr.maxWeight} {settings.unit.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-[#B7FF00]">
                    × {pr.maxWeightReps} REPS
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs font-mono text-[#8A9099]">
                <div>
                  <span className="block text-[10px]">Previous Record</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {pr.previousWeight ? `${pr.previousWeight} ${settings.unit.toUpperCase()} × ${pr.previousReps || 8}` : 'Initial Record'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px]">Estimated 1RM</span>
                  <span className="font-bold text-[#B7FF00] mt-0.5 block">
                    {pr.estimated1RM} {settings.unit.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1RM Calculator */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#B7FF00]" />
            <span>INTERACTIVE 1RM ESTIMATOR</span>
          </h2>
          <p className="text-xs text-[#8A9099] mt-0.5 font-sans">
            Calculate your theoretical one rep max using standard exercise physiology formulas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1.5 block">
              Lifted Weight ({settings.unit.toUpperCase()})
            </label>
            <input
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(Number(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-[#0B0D10] border border-white/10 rounded-xl text-white font-mono font-black text-xl focus:border-[#B7FF00] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1.5 block">
              Reps Completed
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={calcReps}
              onChange={(e) => setCalcReps(Number(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-[#0B0D10] border border-white/10 rounded-xl text-white font-mono font-black text-xl focus:border-[#B7FF00] focus:outline-none"
            />
          </div>
        </div>

        {/* 1RM Banner */}
        <div className="bg-[#1C2026] border border-[#B7FF00]/30 rounded-xl p-4 flex items-center justify-between shadow-neon-sm">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#B7FF00] uppercase tracking-widest block">
              ESTIMATED 1-REP MAX
            </span>
            <div className="text-3xl font-mono font-black text-white mt-0.5 tabular-nums">
              {estimated1RM} <span className="text-sm font-sans text-[#8A9099] font-normal">{settings.unit.toUpperCase()}</span>
            </div>
          </div>
          <div className="text-right text-xs text-[#8A9099] font-mono">
            {calcWeight} {settings.unit.toUpperCase()} × {calcReps} reps
          </div>
        </div>

        {/* Percentages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
          {percentages.map(p => (
            <div
              key={p.pct}
              className="bg-[#0B0D10] border border-white/5 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-black text-[#B7FF00]">{p.pct}%</span>
                <span className="text-xs text-[#8A9099] ml-2">{p.label}</span>
              </div>
              <span className="text-sm font-bold text-white">
                {p.weight} {settings.unit.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
