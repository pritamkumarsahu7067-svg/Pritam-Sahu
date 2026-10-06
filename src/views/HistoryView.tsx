import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { CompletedWorkout } from '../types/workout';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Flame, 
  CheckCircle, 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Trash2,
  Dumbbell,
  ArrowRight
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, deleteHistoryItem, repeatWorkout, settings, startNewWorkout } = useWorkout();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Group workouts by Month for calendar-style view
  const monthsGrouped = history.reduce<Record<string, CompletedWorkout[]>>((acc, w) => {
    const m = new Date(w.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!acc[m]) acc[m] = [];
    acc[m].push(w);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-28 md:pb-14 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-[10px] font-mono font-bold text-[#B7FF00] uppercase tracking-widest block mb-1">
          SESSION LOGBOOK
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          WORKOUT HISTORY
        </h1>
        <p className="text-xs text-[#8A9099] mt-0.5 font-medium">
          Calendar timeline of past sessions and progressive overload breakdowns.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="bg-[#15181D] border border-white/[0.08] rounded-[22px] p-10 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1C2026] border border-white/5 flex items-center justify-center text-[#8A9099] mx-auto">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">No workouts yet.</h3>
            <p className="text-xs text-[#8A9099] max-w-sm mx-auto">
              Start your first workout to begin tracking progress and recording your lifting milestones.
            </p>
          </div>
          <button
            onClick={() => startNewWorkout()}
            className="px-5 py-2.5 rounded-xl bg-[#B7FF00] text-[#0B0D10] font-black text-xs font-mono shadow-neon-sm cursor-pointer"
          >
            START FIRST WORKOUT
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(monthsGrouped).map(([monthYear, workouts]) => (
            <div key={monthYear} className="space-y-3">
              {/* Month Header Banner */}
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8A9099] uppercase tracking-wider px-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#B7FF00]" />
                <span>{monthYear}</span>
                <span className="text-[#B7FF00]">({workouts.length} SESSIONS)</span>
              </div>

              {/* Workout List */}
              <div className="space-y-3">
                {workouts.map((workout: CompletedWorkout) => {
                  const isExpanded = expandedId === workout.id;

                  return (
                    <div
                      key={workout.id}
                      className="bg-[#15181D] border border-white/[0.08] hover:border-white/[0.16] rounded-[20px] overflow-hidden transition-all shadow-xl"
                    >
                      {/* Workout Card Header */}
                      <div 
                        onClick={() => toggleExpand(workout.id)}
                        className="p-4 sm:p-5 flex flex-col gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                                {workout.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#8A9099] mt-0.5 font-mono">
                              <span>{formatDate(workout.date)}</span>
                              <span aria-hidden="true">·</span>
                              <span>{formatTime(workout.date)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {workout.prsAchieved?.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#B7FF00] bg-[#B7FF00]/10 border border-[#B7FF00]/30 px-2 py-0.5 rounded-lg shadow-neon-sm">
                                <Trophy className="w-3 h-3" />
                                <span>{workout.prsAchieved.length} PR</span>
                              </span>
                            )}
                            <button
                              type="button"
                              className="w-8 h-8 rounded-xl bg-[#1C2026] text-[#8A9099] flex items-center justify-center border border-white/5"
                              aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Metric Strip: Exercises, Sets, Total Volume, Duration */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono text-[#8A9099]">
                          <div>
                            <span className="text-[10px] block">VOLUME</span>
                            <span className="text-white font-bold text-sm block mt-0.5">
                              {workout.totalVolume?.toLocaleString()} <span className="text-[10px] text-[#8A9099] font-normal">{settings.unit.toUpperCase()}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] block">DURATION</span>
                            <span className="text-white font-bold text-sm block mt-0.5">
                              {workout.durationMinutes}m
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] block">SETS</span>
                            <span className="text-white font-bold text-sm block mt-0.5">
                              {workout.totalSets}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] block">EXERCISES</span>
                            <span className="text-white font-bold text-sm block mt-0.5">
                              {workout.exercises.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Workout Breakdown */}
                      {isExpanded && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-white/[0.06] space-y-4 bg-[#1C2026]/40">
                          {/* PRs achieved in session */}
                          {workout.prsAchieved?.length > 0 && (
                            <div className="bg-[#1C2026] border border-[#B7FF00]/30 rounded-xl p-3">
                              <span className="text-[10px] font-mono font-bold text-[#B7FF00] uppercase tracking-wider block mb-1">
                                NEW PERSONAL RECORDS:
                              </span>
                              <div className="space-y-1">
                                {workout.prsAchieved.map((pr, idx) => (
                                  <div key={idx} className="text-xs flex items-center justify-between font-mono text-white">
                                    <span className="font-bold">{pr.exerciseName}</span>
                                    <span className="text-[#B7FF00] font-black">{pr.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Exercise List */}
                          <div className="space-y-2.5">
                            {workout.exercises.map((ex, exIdx) => (
                              <div key={ex.id || exIdx} className="bg-[#0B0D10] border border-white/5 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-white uppercase">{ex.name}</span>
                                  <span className="text-[10px] font-mono text-[#8A9099]">{ex.targetMuscle}</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                                  {ex.sets.map((set, sIdx) => (
                                    <div
                                      key={set.id || sIdx}
                                      className={`p-2 rounded-lg border flex items-center justify-between ${
                                        set.completed
                                          ? 'bg-[#15181D] border-white/10 text-white'
                                          : 'bg-[#15181D]/40 border-white/5 text-[#8A9099]'
                                      }`}
                                    >
                                      <span className="text-[#8A9099] text-[10px]">#{set.setNumber}</span>
                                      <span className="font-bold text-[#B7FF00]">
                                        {set.weight}{settings.unit.toUpperCase()} × {set.reps}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Actions: Repeat Routine or Delete */}
                          <div className="pt-2 flex items-center justify-between">
                            <button
                              onClick={() => {
                                if (confirm('Delete this workout from history?')) {
                                  deleteHistoryItem(workout.id);
                                }
                              }}
                              className="text-xs font-mono text-[#8A9099] hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Workout</span>
                            </button>

                            <button
                              onClick={() => repeatWorkout(workout)}
                              className="px-4 py-2 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] font-black text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-neon-sm"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>REPEAT WORKOUT</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
