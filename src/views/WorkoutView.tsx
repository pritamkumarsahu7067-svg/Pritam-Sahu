import React, { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { formatSeconds } from '../utils/calculations';
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle,
  Dumbbell,
  Sparkles,
  Edit2,
  CheckCircle2
} from 'lucide-react';

export const WorkoutView: React.FC = () => {
  const {
    activeWorkout,
    updateActiveWorkoutTitle,
    addSet,
    updateSet,
    toggleSetComplete,
    deleteSet,
    removeExerciseFromWorkout,
    updateSuggestedTarget,
    applySuggestedTargetToSets,
    finishActiveWorkout,
    discardActiveWorkout,
    setExerciseSelectorOpen,
    startNewWorkout,
    restTimer,
    startRestTimer,
    pauseRestTimer,
    resetRestTimer,
    adjustRestTimer,
    settings,
    timerNotification,
    dismissTimerNotification
  } = useWorkout();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [editingTargetExId, setEditingTargetExId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState<number>(50);
  const [editReps, setEditReps] = useState<string>('8–10 reps');

  useEffect(() => {
    if (!activeWorkout) return;

    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - activeWorkout.startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // If no active workout, display clean empty state
  if (!activeWorkout) {
    return (
      <div className="py-16 px-4 max-w-lg mx-auto text-center space-y-6">
        <div className="w-20 h-20 rounded-[22px] bg-[#15181D] border border-white/10 flex items-center justify-center text-[#B7FF00] mx-auto shadow-neon-sm">
          <Dumbbell className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-white tracking-tight">No Workouts In Progress</h2>
          <p className="text-xs text-[#8A9099] max-w-sm mx-auto font-medium">
            Start your first workout to begin tracking your progressive overload and beating your personal records.
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto pt-2">
          <button
            onClick={() => startNewWorkout()}
            className="w-full py-3.5 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] font-black text-sm tracking-wide shadow-neon-glow transition-all cursor-pointer"
          >
            START TODAY'S WORKOUT
          </button>
        </div>
      </div>
    );
  }

  // Calculate live volume and sets
  let currentActiveVolume = 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;

  activeWorkout.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      totalSetsCount++;
      if (s.completed) completedSetsCount++;
      const w = Number(s.weight) || 0;
      const r = Number(s.reps) || 0;
      if (w > 0 && r > 0) {
        currentActiveVolume += w * r;
      }
    });
  });

  const handleFinish = () => {
    const success = finishActiveWorkout();
    if (!success) {
      alert("Please enter weight and reps for at least one completed set before finishing!");
    }
  };

  const handleSaveTarget = (exerciseId: string) => {
    updateSuggestedTarget(exerciseId, {
      weight: editWeight,
      reps: editReps,
      explanation: 'Custom lifter target.'
    });
    setEditingTargetExId(null);
  };

  // Timer circular progress
  const timerProgress = restTimer.totalDuration > 0
    ? Math.min(100, Math.max(0, ((restTimer.totalDuration - restTimer.timeRemaining) / restTimer.totalDuration) * 100))
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-28 md:pb-14">
      {/* Top Workout Status Card */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-4 sm:p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-3">
            <input
              type="text"
              value={activeWorkout.title}
              onChange={(e) => updateActiveWorkoutTitle(e.target.value)}
              className="text-lg sm:text-xl font-black text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#B7FF00] rounded px-1 -ml-1 w-full tracking-tight"
              placeholder="Workout Name"
            />
            <div className="flex items-center gap-3 text-xs text-[#8A9099] mt-1 px-1 font-mono">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Clock className="w-3.5 h-3.5 text-[#B7FF00]" />
                {formatSeconds(elapsedSeconds)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#8A9099]">
                {completedSetsCount} / {totalSetsCount} Completed Sets
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#B7FF00] font-bold">
                {currentActiveVolume.toLocaleString()} {settings.unit.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={() => setExerciseSelectorOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#1C2026] hover:bg-white/10 border border-white/5 text-[#B7FF00] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>EXERCISE</span>
          </button>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-1.5 bg-[#0B0D10] rounded-full overflow-hidden mt-1">
          <div
            style={{ width: `${totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0}%` }}
            className="h-full bg-[#B7FF00] transition-all duration-300"
          />
        </div>
      </div>

      {/* Exercises Container */}
      <div className="space-y-4" id="exerciseContainer">
        {activeWorkout.exercises.map((exercise) => {
          const suggested = exercise.suggestedTarget || {
            weight: 52.5,
            reps: '8–10 reps',
            explanation: 'Based on your previous performance.'
          };

          const firstPrev = exercise.sets[0]?.previous;

          return (
            <div
              key={exercise.id}
              className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-4 sm:p-5 transition-all shadow-xl space-y-4"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#8A9099] mt-0.5 font-mono">
                    <span className="text-[#4D8DFF] font-bold">{exercise.targetMuscle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exercise.equipment}</span>
                  </div>
                </div>

                <button
                  onClick={() => removeExerciseFromWorkout(exercise.id)}
                  title="Remove Exercise"
                  className="w-8 h-8 rounded-xl bg-[#1C2026] hover:bg-red-500/10 text-[#8A9099] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Previous Benchmark & Smart Progression Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {/* Previous Card */}
                <div className="bg-[#1C2026] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-[#8A9099] uppercase tracking-wider font-bold">
                    PREVIOUS
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {firstPrev ? (
                      `${firstPrev.weight} ${settings.unit.toUpperCase()} × ${firstPrev.reps} reps`
                    ) : (
                      `50 ${settings.unit.toUpperCase()} × 10 reps`
                    )}
                  </div>
                </div>

                {/* Suggested Next Target Card */}
                <div className="bg-[#1C2026] border border-[#B7FF00]/25 rounded-xl p-3 flex flex-col justify-between relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#B7FF00] uppercase tracking-wider font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#B7FF00]" />
                      SUGGESTED NEXT TARGET
                    </span>
                    <button
                      onClick={() => {
                        setEditingTargetExId(editingTargetExId === exercise.id ? null : exercise.id);
                        setEditWeight(suggested.weight);
                        setEditReps(suggested.reps);
                      }}
                      title="Edit Target"
                      className="text-[#8A9099] hover:text-white cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  {editingTargetExId !== exercise.id ? (
                    <>
                      <div className="text-sm font-bold text-[#B7FF00] mt-1">
                        {suggested.weight} {settings.unit.toUpperCase()} × {suggested.reps}
                      </div>
                      <p className="text-[10px] text-[#8A9099] mt-1 font-sans">
                        {suggested.explanation}
                      </p>
                      <button
                        onClick={() => applySuggestedTargetToSets(exercise.id)}
                        className="mt-2 text-[10px] font-mono text-[#B7FF00] hover:underline self-start cursor-pointer font-bold"
                      >
                        &rarr; Apply target to empty sets
                      </button>
                    </>
                  ) : (
                    /* Edit Target Inline Form */
                    <div className="mt-2 space-y-2 pt-2 border-t border-white/5">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editWeight}
                          onChange={(e) => setEditWeight(Number(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-[#0B0D10] border border-white/10 rounded text-xs text-white"
                          placeholder="Weight"
                        />
                        <input
                          type="text"
                          value={editReps}
                          onChange={(e) => setEditReps(e.target.value)}
                          className="flex-1 px-2 py-1 bg-[#0B0D10] border border-white/10 rounded text-xs text-white"
                          placeholder="8–10 reps"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTargetExId(null)}
                          className="px-2 py-1 rounded bg-[#0B0D10] text-[10px] text-[#8A9099]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveTarget(exercise.id)}
                          className="px-2 py-1 rounded bg-[#B7FF00] text-[10px] text-[#0B0D10] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sets Table */}
              <div className="space-y-2 pt-1">
                {/* Header row: SET, KG, REPS, DONE */}
                <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 text-[11px] font-mono font-bold text-[#8A9099] uppercase tracking-wider px-1">
                  <span className="text-center">SET</span>
                  <span className="text-center">{settings.unit.toUpperCase()}</span>
                  <span className="text-center">REPS</span>
                  <span className="text-center">DONE</span>
                </div>

                {/* Set Rows */}
                {exercise.sets.map((set, sIdx) => {
                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center p-1.5 rounded-xl transition-all ${
                        set.completed
                          ? 'bg-[#1C2026] border border-[#B7FF00]/30 shadow-neon-sm'
                          : 'bg-[#1C2026]/70 border border-white/5'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="flex items-center justify-center font-mono text-xs font-black text-[#8A9099]">
                        <span>{sIdx + 1}</span>
                      </div>

                      {/* Weight Input */}
                      <div>
                        <input
                          type="number"
                          step={settings.unit === 'kg' ? '0.5' : '1'}
                          placeholder="Weight"
                          value={set.weight}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            updateSet(exercise.id, set.id, { weight: val });
                          }}
                          className={`w-full py-2.5 px-2 text-center font-mono font-black text-sm rounded-xl bg-[#0B0D10] text-white border transition-all focus:outline-none ${
                            set.completed ? 'border-[#B7FF00]/40 text-[#B7FF00]' : 'border-white/10 focus:border-[#B7FF00]'
                          }`}
                        />
                      </div>

                      {/* Reps Input */}
                      <div>
                        <input
                          type="number"
                          step="1"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            updateSet(exercise.id, set.id, { reps: val });
                          }}
                          className={`w-full py-2.5 px-2 text-center font-mono font-black text-sm rounded-xl bg-[#0B0D10] text-white border transition-all focus:outline-none ${
                            set.completed ? 'border-[#B7FF00]/40 text-[#B7FF00]' : 'border-white/10 focus:border-[#B7FF00]'
                          }`}
                        />
                      </div>

                      {/* Done Button */}
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleSetComplete(exercise.id, set.id)}
                          title={set.completed ? 'Completed' : 'Mark set complete'}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                            set.completed
                              ? 'bg-[#B7FF00] text-[#0B0D10] shadow-neon-glow scale-105 ring-2 ring-[#B7FF00]/40'
                              : 'bg-[#0B0D10] text-[#8A9099] hover:text-white border border-white/10 hover:border-white/20'
                          }`}
                        >
                          <Check className={`w-4 h-4 stroke-[3] transition-transform ${set.completed ? 'scale-115' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Set Action Controls */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => addSet(exercise.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B7FF00]" />
                  <span>+ ADD SET</span>
                </button>

                {exercise.sets.length > 1 && (
                  <button
                    onClick={() => deleteSet(exercise.id, exercise.sets[exercise.sets.length - 1].id)}
                    className="text-xs font-mono text-[#8A9099] hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Delete set
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exercise Button */}
      <button
        onClick={() => setExerciseSelectorOpen(true)}
        className="w-full py-4 rounded-[18px] bg-[#15181D] hover:bg-[#1C2026] border border-dashed border-white/15 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:border-[#B7FF00]/40"
      >
        <Plus className="w-4 h-4 text-[#B7FF00]" />
        <span>+ ADD EXERCISE</span>
      </button>

      {/* Rest Timer Card */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 text-center space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B7FF00]" />
            <span>REST TIMER</span>
          </h2>
          <span className="text-xs text-[#8A9099] font-mono">
            {restTimer.exerciseName ? restTimer.exerciseName : 'Recovery'}
          </span>
        </div>

        {/* Large Circular Countdown */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <svg className="w-44 h-44 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#1C2026]"
              strokeWidth="2.8"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#B7FF00] transition-all duration-300"
              strokeDasharray={`${timerProgress}, 100`}
              strokeLinecap="round"
              strokeWidth="2.8"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <div className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums" id="timer">
              {formatSeconds(restTimer.timeRemaining)}
            </div>
            <span className="text-[10px] font-mono font-bold text-[#8A9099] uppercase tracking-wider mt-1">
              {restTimer.isActive ? 'ACTIVE REST' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Notification Toast if timer completed */}
        {timerNotification && (
          <div className="bg-[#B7FF00]/10 border border-[#B7FF00]/40 rounded-xl p-3 flex items-center justify-between text-xs text-[#B7FF00] font-bold animate-in fade-in">
            <span>{timerNotification}</span>
            <button
              onClick={dismissTimerNotification}
              className="px-2 py-0.5 rounded bg-[#B7FF00] text-[#0B0D10] text-[10px] cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {/* Buttons: START, PAUSE, RESET */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {restTimer.isActive ? (
            <button
              onClick={pauseRestTimer}
              className="px-6 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={() => startRestTimer(restTimer.timeRemaining || 90)}
              className="px-6 py-2.5 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-neon-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#0B0D10]" />
              <span>START</span>
            </button>
          )}

          <button
            onClick={resetRestTimer}
            className="px-5 py-2.5 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        {/* Quick Presets: 30s, 60s, 90s, 120s, 180s */}
        <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap">
          {[30, 60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              onClick={() => startRestTimer(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                restTimer.timeRemaining === sec && !restTimer.isActive
                  ? 'bg-[#B7FF00] border-[#B7FF00] text-[#0B0D10]'
                  : 'bg-[#1C2026] border-white/5 text-[#8A9099] hover:text-white'
              }`}
            >
              {sec < 60 ? `${sec}s` : `${sec / 60}m`}
            </button>
          ))}
          <button
            onClick={() => adjustRestTimer(15)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#1C2026] border border-white/5 text-white hover:border-[#B7FF00]/40"
          >
            +15s
          </button>
        </div>
      </div>

      {/* Finish Workout Primary Button */}
      <div className="pt-2 space-y-3">
        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-[18px] bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] font-black text-base tracking-wider shadow-neon-glow active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>FINISH WORKOUT</span>
        </button>

        {/* Discard Workout option */}
        <div className="text-center">
          {!confirmDiscard ? (
            <button
              onClick={() => setConfirmDiscard(true)}
              className="text-xs font-mono text-[#8A9099] hover:text-red-400 transition-colors cursor-pointer"
            >
              Discard this workout
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-red-950/20 border border-red-500/30 rounded-xl p-3">
              <span className="text-xs text-red-300 font-bold flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" /> Discard session progress?
              </span>
              <button
                onClick={discardActiveWorkout}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono cursor-pointer"
              >
                Yes, Discard
              </button>
              <button
                onClick={() => setConfirmDiscard(false)}
                className="px-3 py-1 rounded-lg bg-[#1C2026] text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
