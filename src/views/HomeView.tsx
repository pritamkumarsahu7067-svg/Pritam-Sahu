import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { WORKOUT_TEMPLATES } from '../data/exercises';
import { Dumbbell, Flame, Trophy, Play, Plus, ArrowRight, Zap, TrendingUp, Check, Award, Clock } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    stats, 
    settings, 
    activeWorkout, 
    setActiveTab, 
    startNewWorkout, 
    prs, 
    history,
    setPlateCalcOpen
  } = useWorkout();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  // Recent PRs list
  const recentPRs = Object.values(prs).slice(0, 3);

  // Weekly progress calculation (workouts per day over past 7 days)
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7;

  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayIndex);
  monday.setHours(0, 0, 0, 0);

  const workoutsThisWeek = history.filter(w => new Date(w.date) >= monday);
  const workoutDaysSet = new Set(
    workoutsThisWeek.map(w => (new Date(w.date).getDay() + 6) % 7)
  );

  // Volume by day for the weekly chart
  const weeklyDayVolume: number[] = [0, 0, 0, 0, 0, 0, 0];
  workoutsThisWeek.forEach(w => {
    const dayIdx = (new Date(w.date).getDay() + 6) % 7;
    weeklyDayVolume[dayIdx] += w.totalVolume || 0;
  });

  const maxVolumeInWeek = Math.max(...weeklyDayVolume, 2000);

  // Today's workout display info
  const workoutTitle = activeWorkout?.title || "Push Day (Hypertrophy)";
  const exerciseCount = activeWorkout ? activeWorkout.exercises.length : 5;
  const estimatedDuration = activeWorkout ? 50 : 55;
  const currentProgress = stats.completionPercentage; // 0%, 25%, 50%, 75%, 100%

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase() || 'PS';
  };

  return (
    <div className="space-y-6 pb-28 md:pb-14 max-w-4xl mx-auto">
      {/* Top Greeting Section */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
            {getGreeting()}
          </h1>
          <p className="text-sm text-[#8A9099] mt-0.5 font-medium">
            Ready to crush your workout?
          </p>
        </div>

        {/* Profile / Avatar Button on the right */}
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-[#15181D] hover:bg-[#1C2026] border border-white/[0.08] transition-all cursor-pointer group"
          title={`Athlete: ${settings.profile.name} (${settings.profile.email})`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B7FF00] to-emerald-500 text-[#0B0D10] font-black text-sm flex items-center justify-center shadow-neon-sm font-mono">
            {getInitials(settings.profile.name)}
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold text-white block group-hover:text-[#B7FF00] transition-colors">
              {settings.profile.name}
            </span>
            <span className="text-[10px] text-[#8A9099] font-mono block truncate max-w-[170px]">
              {settings.profile.email || 'pritamkumarsahu7067@gmail.com'}
            </span>
          </div>
        </button>
      </div>

      {/* Large "Today's Workout" Card */}
      <div className="relative overflow-hidden bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-2xl transition-all">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7FF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-[#B7FF00] bg-[#B7FF00]/10 border border-[#B7FF00]/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {activeWorkout ? 'IN PROGRESS' : "TODAY'S WORKOUT"}
              </span>
              <span className="text-xs text-[#8A9099] font-mono">
                {activeWorkout ? 'Live Session' : 'Scheduled'}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {workoutTitle}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#8A9099] mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-[#B7FF00]" />
                  {exerciseCount} Exercises
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#4D8DFF]" />
                  ~{estimatedDuration} Mins
                </span>
              </div>
            </div>

            <div className="pt-2">
              {activeWorkout ? (
                <button
                  onClick={() => setActiveTab('workout')}
                  className="px-6 py-3 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] font-black text-sm tracking-wide shadow-neon-glow flex items-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Play className="w-4 h-4 fill-[#0B0D10]" />
                  <span>RESUME WORKOUT</span>
                </button>
              ) : (
                <button
                  onClick={() => startNewWorkout()}
                  className="px-6 py-3 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] font-black text-sm tracking-wide shadow-neon-glow flex items-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>START WORKOUT</span>
                </button>
              )}
            </div>
          </div>

          {/* Circular Workout Progress Indicator */}
          <div className="flex items-center justify-center self-center sm:self-auto">
            <div className="relative w-28 h-28 flex items-center justify-center bg-[#1C2026] rounded-full p-2 border border-white/5 shadow-inner">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#0B0D10]"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#B7FF00] transition-all duration-700 ease-out"
                  strokeDasharray={`${currentProgress}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-xl font-black text-white tracking-tight tabular-nums">
                  {currentProgress}%
                </span>
                <span className="text-[9px] font-mono text-[#8A9099] uppercase tracking-wider font-bold">
                  DONE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Four Modern Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Workouts */}
        <div className="bg-[#15181D] border border-white/[0.08] hover:border-white/[0.15] rounded-[18px] p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Total Workouts</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-mono font-black text-white tabular-nums tracking-tight">
              {stats.totalWorkouts}
            </h3>
            <span className="text-xs font-mono font-bold text-[#4D8DFF] bg-[#4D8DFF]/10 px-2 py-0.5 rounded-md">
              LOGGED
            </span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-[#15181D] border border-white/[0.08] hover:border-white/[0.15] rounded-[18px] p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Current Streak</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-mono font-black text-white tabular-nums tracking-tight flex items-center gap-1">
              {stats.currentStreak} <span className="text-2xl">🔥</span>
            </h3>
            <span className="text-xs font-mono font-bold text-[#B7FF00] bg-[#B7FF00]/10 px-2 py-0.5 rounded-md">
              DAYS
            </span>
          </div>
        </div>

        {/* Training Volume */}
        <div className="bg-[#15181D] border border-white/[0.08] hover:border-white/[0.15] rounded-[18px] p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Training Volume</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-mono font-black text-white tabular-nums tracking-tight">
              {stats.totalVolume > 99999
                ? `${Math.round(stats.totalVolume / 1000)}k`
                : stats.totalVolume.toLocaleString()}
            </h3>
            <span className="text-xs font-mono font-bold text-[#8A9099]">
              {settings.unit.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-[#15181D] border border-white/[0.08] hover:border-white/[0.15] rounded-[18px] p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <span className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">Personal Records</span>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-3xl font-mono font-black text-white tabular-nums tracking-tight flex items-center gap-1">
              {stats.totalPRsCount}
            </h3>
            <span className="text-xs font-mono font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-md">
              PRs
            </span>
          </div>
        </div>
      </div>

      {/* "Your Progress" Weekly Progress Chart */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              YOUR PROGRESS
            </h2>
            <p className="text-xs text-[#8A9099] mt-0.5">
              Weekly workout frequency & volume distribution
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#B7FF00] bg-[#B7FF00]/10 px-2.5 py-1 rounded-lg">
            {stats.thisWeekCount} / {settings.weeklyGoal} SESSIONS
          </span>
        </div>

        {/* 7-Day Interactive Columns */}
        <div className="h-40 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-1">
          {daysOfWeek.map((day, idx) => {
            const vol = weeklyDayVolume[idx];
            const hasWorkout = workoutDaysSet.has(idx);
            const heightPct = vol > 0 ? Math.max(25, Math.min(100, Math.round((vol / maxVolumeInWeek) * 100))) : 8;
            const isToday = currentDayIndex === idx;

            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[9px] font-mono text-[#B7FF00] opacity-0 group-hover:opacity-100 transition-opacity">
                  {vol > 0 ? `${Math.round(vol / 1000)}k` : '—'}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-xl transition-all duration-300 ${
                    hasWorkout
                      ? 'bg-gradient-to-t from-[#B7FF00]/80 to-[#B7FF00] shadow-neon-sm'
                      : isToday
                      ? 'bg-[#1C2026] border border-white/20'
                      : 'bg-[#1C2026]/60'
                  }`}
                />
                <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-[#B7FF00]' : 'text-[#8A9099]'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Recent PRs" Attractive PR Cards */}
      {recentPRs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#B7FF00]" />
              <span>RECENT PRs</span>
            </h2>
            <button
              onClick={() => setActiveTab('progress')}
              className="text-xs font-mono font-bold text-[#B7FF00] hover:text-[#B7FF00]/80 transition-colors cursor-pointer"
            >
              VIEW ALL &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentPRs.map((pr) => (
              <div
                key={pr.exerciseName}
                className="bg-[#15181D] border border-white/[0.08] hover:border-[#B7FF00]/40 rounded-[18px] p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#B7FF00] bg-[#B7FF00]/10 px-2 py-0.5 rounded">
                      NEW RECORD
                    </span>
                    <Award className="w-4 h-4 text-[#B7FF00]" />
                  </div>
                  <h3 className="text-sm font-black text-white mt-2 uppercase tracking-tight">
                    {pr.exerciseName}
                  </h3>
                  <div className="mt-2 font-mono text-xl font-black text-white tabular-nums">
                    {pr.maxWeight} {settings.unit.toUpperCase()} <span className="text-xs text-[#8A9099] font-normal">× {pr.maxWeightReps} REPS</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#8A9099]">
                  <span>Previous: {pr.previousWeight ? `${pr.previousWeight}${settings.unit.toUpperCase()}` : 'Initial'}</span>
                  <span>Est 1RM: {pr.estimated1RM}{settings.unit.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Templates Quick Start */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            WORKOUT ROUTINES
          </h2>
          <span className="text-xs text-[#8A9099] font-mono">Curated Hypertrophy Splits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WORKOUT_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-[#15181D] border border-white/[0.08] hover:border-white/[0.15] rounded-[18px] p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#B7FF00] transition-colors">
                    {tmpl.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8A9099]">
                    ~{tmpl.estimatedDuration}m
                  </span>
                </div>
                <p className="text-xs text-[#8A9099] mt-1 line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8A9099]">
                  {tmpl.exercises.length} lifts
                </span>
                <button
                  onClick={() => startNewWorkout(tmpl)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1C2026] hover:bg-[#B7FF00] text-white hover:text-[#0B0D10] text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>START</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
