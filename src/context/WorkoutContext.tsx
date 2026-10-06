import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  ActiveWorkout, 
  CompletedWorkout, 
  PersonalRecord, 
  UserSettings, 
  WorkoutExercise, 
  WorkoutSet, 
  ExerciseDefinition, 
  WorkoutRoutineTemplate,
  PRRecord,
  TimeRangeFilter,
  SmartProgressionTarget,
  UserProfile
} from '../types/workout';
import { EXERCISE_DATABASE, WORKOUT_TEMPLATES } from '../data/exercises';
import { calculate1RM, calculateSmartProgression, calculateStreak, getStarterWorkoutData } from '../utils/calculations';
import { sound } from '../utils/audio';

interface RestTimerState {
  isActive: boolean;
  timeRemaining: number;
  totalDuration: number;
  exerciseName?: string;
}

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  history: CompletedWorkout[];
  prs: Record<string, PersonalRecord>;
  settings: UserSettings;
  restTimer: RestTimerState;
  timerNotification: string | null;
  dismissTimerNotification: () => void;
  activeTab: 'home' | 'workout' | 'progress' | 'history' | 'profile';
  setActiveTab: (tab: 'home' | 'workout' | 'progress' | 'history' | 'profile') => void;
  timeRangeFilter: TimeRangeFilter;
  setTimeRangeFilter: (filter: TimeRangeFilter) => void;
  completedModalData: CompletedWorkout | null;
  closeCompletedModal: () => void;
  plateCalcOpen: boolean;
  setPlateCalcOpen: (open: boolean) => void;
  exerciseSelectorOpen: boolean;
  setExerciseSelectorOpen: (open: boolean) => void;
  
  // Workout Operations
  startNewWorkout: (template?: WorkoutRoutineTemplate) => void;
  updateActiveWorkoutTitle: (title: string) => void;
  addExerciseToWorkout: (exerciseDef: ExerciseDefinition) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  updateSuggestedTarget: (exerciseId: string, updates: Partial<SmartProgressionTarget>) => void;
  applySuggestedTargetToSets: (exerciseId: string) => void;
  finishActiveWorkout: () => boolean;
  discardActiveWorkout: () => void;
  repeatWorkout: (completed: CompletedWorkout) => void;
  
  // Timer Operations
  startRestTimer: (seconds?: number, exerciseName?: string) => void;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;
  adjustRestTimer: (secondsDelta: number) => void;
  dismissRestTimer: () => void;
  
  // Settings & Profile
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  deleteHistoryItem: (id: string) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;

  // Computed Stats
  stats: {
    totalWorkouts: number;
    currentStreak: number;
    totalVolume: number;
    totalPRsCount: number;
    thisWeekCount: number;
    completionPercentage: number;
  };
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEY_WORKOUTS = 'smart_gym_workouts_v2';
const STORAGE_KEY_ACTIVE = 'smart_gym_active_v2';
const STORAGE_KEY_PRS = 'smart_gym_prs_v2';
const STORAGE_KEY_SETTINGS = 'smart_gym_settings_v2';

const DEFAULT_SETTINGS: UserSettings = {
  unit: 'kg',
  defaultRestSeconds: 90,
  soundEnabled: true,
  autoTimerOnComplete: true,
  weeklyGoal: 4,
  profile: {
    name: 'Pritam Kumar Sahu',
    email: 'pritamkumarsahu7067@gmail.com',
    fitnessGoal: 'Hypertrophy & Strength',
    experienceLevel: 'Intermediate',
    trainingDays: 4,
  }
};

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const mergedProfile = {
          ...DEFAULT_SETTINGS.profile,
          ...(parsed.profile || {}),
          // Ensure user's email is set to pritamkumarsahu7067@gmail.com
          email: parsed.profile?.email || 'pritamkumarsahu7067@gmail.com',
          name: (!parsed.profile?.name || parsed.profile.name === 'Alex Mercer') ? 'Pritam Kumar Sahu' : parsed.profile.name,
        };
        return { 
          ...DEFAULT_SETTINGS, 
          ...parsed, 
          profile: mergedProfile 
        };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Load history & PRs
  const [history, setHistory] = useState<CompletedWorkout[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKOUTS);
      if (saved) return JSON.parse(saved);
      const starter = getStarterWorkoutData();
      return starter.history;
    } catch {}
    return [];
  });

  const [prs, setPrs] = useState<Record<string, PersonalRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRS);
      if (saved) return JSON.parse(saved);
      const starter = getStarterWorkoutData();
      return starter.prs;
    } catch {}
    return {};
  });

  // Active workout
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial active session with bench press and smart suggestion
    return {
      id: `workout_${Date.now()}`,
      title: "Today's Workout",
      startTime: Date.now(),
      exercises: [
        {
          id: `ex_${Date.now()}`,
          exerciseId: 'bench_press',
          name: 'Barbell Bench Press',
          targetMuscle: 'CHEST',
          equipment: 'Barbell',
          suggestedTarget: {
            weight: 52.5,
            reps: '8–10 reps',
            explanation: 'Based on your previous performance (50 kg × 10 reps).'
          },
          sets: [
            { id: `s1_${Date.now()}`, setNumber: 1, weight: 50, reps: 10, completed: true, type: 'normal', previous: { weight: 50, reps: 10 } },
            { id: `s2_${Date.now()}`, setNumber: 2, weight: 50, reps: 10, completed: true, type: 'normal', previous: { weight: 50, reps: 10 } },
            { id: `s3_${Date.now()}`, setNumber: 3, weight: 50, reps: 8, completed: true, type: 'normal', previous: { weight: 50, reps: 10 } },
          ]
        }
      ]
    };
  });

  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'progress' | 'history' | 'profile'>('home');
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('30D');
  const [completedModalData, setCompletedModalData] = useState<CompletedWorkout | null>(null);
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [exerciseSelectorOpen, setExerciseSelectorOpen] = useState(false);
  const [timerNotification, setTimerNotification] = useState<string | null>(null);

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    timeRemaining: 90,
    totalDuration: 90,
  });

  const timerRef = useRef<number | null>(null);

  // Persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(prs));
    } catch {}
  }, [prs]);

  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    } catch {}
  }, [activeWorkout]);

  const dismissTimerNotification = useCallback(() => {
    setTimerNotification(null);
  }, []);

  // Rest Timer Countdown logic with Web Audio cues
  useEffect(() => {
    if (restTimer.isActive && restTimer.timeRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setRestTimer(prev => {
          if (!prev.isActive) return prev;
          const nextTime = prev.timeRemaining - 1;

          if (settings.soundEnabled) {
            if (nextTime === 3 || nextTime === 2 || nextTime === 1) {
              sound.playCountdownBeep(640);
            } else if (nextTime === 0) {
              sound.playTimerDone();
            }
          }

          if (nextTime <= 0) {
            setTimerNotification('Rest complete — next set! 💪');
            return {
              ...prev,
              timeRemaining: 0,
              isActive: false,
            };
          }
          return {
            ...prev,
            timeRemaining: nextTime,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [restTimer.isActive, restTimer.timeRemaining, settings.soundEnabled]);

  // Start rest timer
  const startRestTimer = useCallback((seconds?: number, exerciseName?: string) => {
    const duration = seconds ?? (restTimer.timeRemaining > 0 ? restTimer.timeRemaining : settings.defaultRestSeconds);
    setTimerNotification(null);
    setRestTimer({
      isActive: true,
      timeRemaining: duration,
      totalDuration: duration,
      exerciseName,
    });
  }, [settings.defaultRestSeconds, restTimer.timeRemaining]);

  const pauseRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isActive: false }));
  }, []);

  const resetRestTimer = useCallback(() => {
    setRestTimer(prev => ({
      ...prev,
      timeRemaining: prev.totalDuration,
      isActive: false,
    }));
  }, []);

  const adjustRestTimer = useCallback((delta: number) => {
    setRestTimer(prev => {
      const newTime = Math.max(5, prev.timeRemaining + delta);
      return {
        ...prev,
        timeRemaining: newTime,
        totalDuration: Math.max(prev.totalDuration, newTime),
      };
    });
  }, []);

  const dismissRestTimer = useCallback(() => {
    setRestTimer({
      isActive: false,
      timeRemaining: settings.defaultRestSeconds,
      totalDuration: settings.defaultRestSeconds,
    });
  }, [settings.defaultRestSeconds]);

  // Start workout (either blank or from template)
  const startNewWorkout = useCallback((template?: WorkoutRoutineTemplate) => {
    const newId = `workout_${Date.now()}`;
    if (!template) {
      const benchSug = calculateSmartProgression(50, 10, settings.unit);
      setActiveWorkout({
        id: newId,
        title: "Today's Workout",
        startTime: Date.now(),
        exercises: [
          {
            id: `ex_${Date.now()}`,
            exerciseId: 'bench_press',
            name: 'Barbell Bench Press',
            targetMuscle: 'CHEST',
            equipment: 'Barbell',
            suggestedTarget: benchSug,
            sets: [
              { id: `s1_${Date.now()}`, setNumber: 1, weight: '', reps: '', completed: false, type: 'normal', previous: { weight: 50, reps: 10 } },
              { id: `s2_${Date.now()}`, setNumber: 2, weight: '', reps: '', completed: false, type: 'normal', previous: { weight: 50, reps: 10 } },
              { id: `s3_${Date.now()}`, setNumber: 3, weight: '', reps: '', completed: false, type: 'normal', previous: { weight: 50, reps: 10 } },
            ]
          }
        ]
      });
    } else {
      const exercises: WorkoutExercise[] = template.exercises.map((tEx, idx) => {
        const def = EXERCISE_DATABASE.find(e => e.id === tEx.exerciseId) || {
          id: tEx.exerciseId,
          name: tEx.exerciseId,
          category: 'CHEST' as const,
          equipment: 'Barbell' as const,
          defaultRestSeconds: 90
        };

        let prevWeight: number | undefined;
        let prevReps: number | undefined;
        for (const past of history) {
          const pastEx = past.exercises.find(e => e.exerciseId === tEx.exerciseId);
          if (pastEx && pastEx.sets.length > 0) {
            const valid = pastEx.sets.find(s => s.completed && typeof s.weight === 'number');
            if (valid && typeof valid.weight === 'number' && typeof valid.reps === 'number') {
              prevWeight = valid.weight;
              prevReps = valid.reps;
              break;
            }
          }
        }

        const suggested = calculateSmartProgression(prevWeight || (settings.unit === 'kg' ? 50 : 115), prevReps || tEx.targetReps, settings.unit);

        const sets: WorkoutSet[] = Array.from({ length: tEx.sets }, (_, sIdx) => ({
          id: `s_${idx}_${sIdx}_${Date.now()}`,
          setNumber: sIdx + 1,
          weight: '',
          reps: tEx.targetReps || '',
          completed: false,
          type: 'normal',
          previous: prevWeight ? { weight: prevWeight, reps: prevReps || tEx.targetReps } : undefined,
        }));

        return {
          id: `ex_${idx}_${Date.now()}`,
          exerciseId: def.id,
          name: def.name,
          targetMuscle: def.category,
          equipment: def.equipment,
          suggestedTarget: suggested,
          sets,
        };
      });

      setActiveWorkout({
        id: newId,
        title: template.name,
        startTime: Date.now(),
        exercises,
      });
    }

    setActiveTab('workout');
  }, [history, settings.unit]);

  const updateActiveWorkoutTitle = useCallback((title: string) => {
    setActiveWorkout(prev => prev ? { ...prev, title } : null);
  }, []);

  const addExerciseToWorkout = useCallback((def: ExerciseDefinition) => {
    let prevWeight: number | undefined;
    let prevReps: number | undefined;
    for (const past of history) {
      const pastEx = past.exercises.find(e => e.exerciseId === def.id || e.name.toLowerCase() === def.name.toLowerCase());
      if (pastEx && pastEx.sets.length > 0) {
        const valid = pastEx.sets.find(s => s.completed && typeof s.weight === 'number');
        if (valid && typeof valid.weight === 'number' && typeof valid.reps === 'number') {
          prevWeight = valid.weight;
          prevReps = valid.reps;
          break;
        }
      }
    }

    const suggested = calculateSmartProgression(prevWeight || (settings.unit === 'kg' ? 40 : 95), prevReps || 10, settings.unit);

    const newExercise: WorkoutExercise = {
      id: `ex_${Date.now()}`,
      exerciseId: def.id,
      name: def.name,
      targetMuscle: def.category,
      equipment: def.equipment,
      suggestedTarget: suggested,
      sets: [
        { 
          id: `s1_${Date.now()}`, 
          setNumber: 1, 
          weight: '', 
          reps: '', 
          completed: false, 
          type: 'normal',
          previous: prevWeight ? { weight: prevWeight, reps: prevReps || 10 } : undefined
        },
        { 
          id: `s2_${Date.now()}`, 
          setNumber: 2, 
          weight: '', 
          reps: '', 
          completed: false, 
          type: 'normal',
          previous: prevWeight ? { weight: prevWeight, reps: prevReps || 10 } : undefined
        },
        { 
          id: `s3_${Date.now()}`, 
          setNumber: 3, 
          weight: '', 
          reps: '', 
          completed: false, 
          type: 'normal',
          previous: prevWeight ? { weight: prevWeight, reps: prevReps || 10 } : undefined
        },
      ]
    };

    setActiveWorkout(prev => {
      if (!prev) {
        return {
          id: `workout_${Date.now()}`,
          title: "Today's Workout",
          startTime: Date.now(),
          exercises: [newExercise]
        };
      }
      return {
        ...prev,
        exercises: [...prev.exercises, newExercise]
      };
    });
  }, [history, settings.unit]);

  const removeExerciseFromWorkout = useCallback((exerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter(e => e.id !== exerciseId)
      };
    });
  }, []);

  const addSet = useCallback((exerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          const nextSetNumber = ex.sets.length + 1;
          const lastSet = ex.sets[ex.sets.length - 1];

          const newSet: WorkoutSet = {
            id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            setNumber: nextSetNumber,
            weight: lastSet ? lastSet.weight : '',
            reps: lastSet ? lastSet.reps : '',
            completed: false,
            type: 'normal',
            previous: lastSet?.previous
          };

          return {
            ...ex,
            sets: [...ex.sets, newSet]
          };
        })
      };
    });
  }, []);

  const updateSet = useCallback((exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
          };
        })
      };
    });
  }, []);

  const updateSuggestedTarget = useCallback((exerciseId: string, updates: Partial<SmartProgressionTarget>) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          const current = ex.suggestedTarget || { weight: 50, reps: '8–10 reps', explanation: 'Custom Target' };
          return {
            ...ex,
            suggestedTarget: { ...current, ...updates }
          };
        })
      };
    });
  }, []);

  const applySuggestedTargetToSets = useCallback((exerciseId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId || !ex.suggestedTarget) return ex;
          const suggestedWeight = ex.suggestedTarget.weight;
          const repMatch = ex.suggestedTarget.reps.match(/\d+/);
          const suggestedReps = repMatch ? parseInt(repMatch[0], 10) : 10;

          return {
            ...ex,
            sets: ex.sets.map(s => s.completed ? s : { ...s, weight: suggestedWeight, reps: suggestedReps })
          };
        })
      };
    });
  }, []);

  const toggleSetComplete = useCallback((exerciseId: string, setId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      let targetExName = '';
      let isNowComplete = false;

      const updatedExercises = prev.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        targetExName = ex.name;
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id !== setId) return s;
            isNowComplete = !s.completed;
            return { ...s, completed: isNowComplete };
          })
        };
      });

      if (isNowComplete) {
        if (settings.soundEnabled) {
          sound.playTick();
        }
        if (settings.autoTimerOnComplete) {
          startRestTimer(settings.defaultRestSeconds, targetExName);
        }
      }

      return {
        ...prev,
        exercises: updatedExercises
      };
    });
  }, [settings.soundEnabled, settings.autoTimerOnComplete, settings.defaultRestSeconds, startRestTimer]);

  const deleteSet = useCallback((exerciseId: string, setId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          const remaining = ex.sets.filter(s => s.id !== setId);
          const renumbered = remaining.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
          return {
            ...ex,
            sets: renumbered
          };
        })
      };
    });
  }, []);

  const finishActiveWorkout = useCallback((): boolean => {
    if (!activeWorkout) return false;

    let totalVolume = 0;
    let completedSetsCount = 0;
    const newPrsAchieved: PRRecord[] = [];
    const updatedPrs = { ...prs };

    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        const w = typeof set.weight === 'number' ? set.weight : Number(set.weight) || 0;
        const r = typeof set.reps === 'number' ? set.reps : Number(set.reps) || 0;

        if (w > 0 && r > 0) {
          totalVolume += w * r;
        }

        if (set.completed && w > 0 && r > 0) {
          completedSetsCount++;
          const currentPR = updatedPrs[ex.name];
          const est1RM = calculate1RM(w, r);
          const setVolume = w * r;

          let isPR = false;
          if (!currentPR) {
            updatedPrs[ex.name] = {
              exerciseName: ex.name,
              maxWeight: w,
              maxWeightReps: r,
              maxReps: r,
              maxVolumeInSet: setVolume,
              estimated1RM: est1RM,
              lastUpdated: new Date().toISOString(),
            };
            isPR = true;
            newPrsAchieved.push({
              exerciseName: ex.name,
              weight: w,
              reps: r,
              metric: 'weight',
              description: `${w} ${settings.unit.toUpperCase()} × ${r} REPS`,
              previousRecord: 'First Record',
              date: new Date().toISOString()
            });
          } else {
            if (w > currentPR.maxWeight) {
              isPR = true;
              newPrsAchieved.push({
                exerciseName: ex.name,
                weight: w,
                reps: r,
                metric: 'weight',
                description: `${w} ${settings.unit.toUpperCase()} × ${r} REPS`,
                previousRecord: `${currentPR.maxWeight} ${settings.unit.toUpperCase()} × ${currentPR.maxWeightReps} REPS`,
                date: new Date().toISOString()
              });
              currentPR.previousWeight = currentPR.maxWeight;
              currentPR.previousReps = currentPR.maxWeightReps;
              currentPR.maxWeight = w;
              currentPR.maxWeightReps = r;
            } else if (w === currentPR.maxWeight && r > currentPR.maxWeightReps) {
              isPR = true;
              newPrsAchieved.push({
                exerciseName: ex.name,
                weight: w,
                reps: r,
                metric: 'reps',
                description: `${w} ${settings.unit.toUpperCase()} × ${r} REPS`,
                previousRecord: `${currentPR.maxWeight} ${settings.unit.toUpperCase()} × ${currentPR.maxWeightReps} REPS`,
                date: new Date().toISOString()
              });
              currentPR.previousWeight = currentPR.maxWeight;
              currentPR.previousReps = currentPR.maxWeightReps;
              currentPR.maxWeightReps = r;
            }

            if (r > currentPR.maxReps) {
              currentPR.maxReps = r;
            }

            if (setVolume > currentPR.maxVolumeInSet) {
              currentPR.maxVolumeInSet = setVolume;
            }

            if (est1RM > currentPR.estimated1RM) {
              currentPR.estimated1RM = est1RM;
            }

            if (isPR) {
              currentPR.lastUpdated = new Date().toISOString();
            }
          }
        }
      });
    });

    if (totalVolume === 0 && completedSetsCount === 0) {
      return false;
    }

    const endTime = Date.now();
    const durationMinutes = Math.max(1, Math.round((endTime - activeWorkout.startTime) / (1000 * 60)));

    const completed: CompletedWorkout = {
      id: `completed_${Date.now()}`,
      title: activeWorkout.title || "Completed Workout",
      date: new Date().toISOString(),
      startTime: activeWorkout.startTime,
      endTime,
      durationMinutes,
      totalVolume,
      totalSets: completedSetsCount,
      prsAchieved: newPrsAchieved,
      exercises: activeWorkout.exercises,
      notes: activeWorkout.notes,
    };

    setHistory(prev => [completed, ...prev]);
    setPrs(updatedPrs);

    if (settings.soundEnabled) {
      if (newPrsAchieved.length > 0) {
        sound.playPRFanfare();
      } else {
        sound.playTimerDone();
      }
    }

    setActiveWorkout(null);
    dismissRestTimer();
    setCompletedModalData(completed);

    return true;
  }, [activeWorkout, prs, settings, dismissRestTimer]);

  const discardActiveWorkout = useCallback(() => {
    setActiveWorkout(null);
    dismissRestTimer();
  }, [dismissRestTimer]);

  const repeatWorkout = useCallback((completed: CompletedWorkout) => {
    const newId = `workout_${Date.now()}`;
    const newExercises: WorkoutExercise[] = completed.exercises.map((ex, exIdx) => {
      const lastCompleted = ex.sets.find(s => s.completed && typeof s.weight === 'number');
      const prevW = lastCompleted && typeof lastCompleted.weight === 'number' ? lastCompleted.weight : 50;
      const prevR = lastCompleted && typeof lastCompleted.reps === 'number' ? lastCompleted.reps : 10;
      const sug = calculateSmartProgression(prevW, prevR, settings.unit);

      return {
        id: `ex_${Date.now()}_${exIdx}`,
        exerciseId: ex.exerciseId,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        equipment: ex.equipment,
        notes: ex.notes,
        suggestedTarget: sug,
        sets: ex.sets.map((s, sIdx) => ({
          id: `s_${Date.now()}_${exIdx}_${sIdx}`,
          setNumber: s.setNumber,
          weight: '',
          reps: s.reps,
          completed: false,
          type: s.type,
          previous: typeof s.weight === 'number' && typeof s.reps === 'number' ? { weight: s.weight, reps: s.reps } : undefined,
        }))
      };
    });

    setActiveWorkout({
      id: newId,
      title: completed.title,
      startTime: Date.now(),
      exercises: newExercises,
    });

    setActiveTab('workout');
  }, [settings.unit]);

  const closeCompletedModal = useCallback(() => {
    setCompletedModalData(null);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateProfile = useCallback((profileUpdates: Partial<UserProfile>) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdates }
    }));
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(w => w.id !== id));
  }, []);

  const resetToSampleData = useCallback(() => {
    const starter = getStarterWorkoutData();
    setHistory(starter.history);
    setPrs(starter.prs);
  }, []);

  const clearAllData = useCallback(() => {
    setHistory([]);
    setPrs({});
    setActiveWorkout(null);
    localStorage.removeItem(STORAGE_KEY_WORKOUTS);
    localStorage.removeItem(STORAGE_KEY_PRS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
  }, []);

  const exportDataJson = useCallback(() => {
    const bundle = {
      history,
      prs,
      settings,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(bundle, null, 2);
  }, [history, prs, settings]);

  const importDataJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.history && Array.isArray(parsed.history)) {
        setHistory(parsed.history);
      }
      if (parsed.prs && typeof parsed.prs === 'object') {
        setPrs(parsed.prs);
      }
      if (parsed.settings) {
        setSettings(prev => ({ ...prev, ...parsed.settings }));
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const streakInfo = calculateStreak(history);
  const totalVolume = history.reduce((acc, curr) => acc + (curr.totalVolume || 0), 0);
  const totalPRsCount = Object.keys(prs).length;

  // Active workout completion % calculation
  let totalSets = 0;
  let completedSets = 0;
  if (activeWorkout) {
    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        totalSets++;
        if (s.completed) completedSets++;
      });
    });
  }
  const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        history,
        prs,
        settings,
        restTimer,
        timerNotification,
        dismissTimerNotification,
        activeTab,
        setActiveTab,
        timeRangeFilter,
        setTimeRangeFilter,
        completedModalData,
        closeCompletedModal,
        plateCalcOpen,
        setPlateCalcOpen,
        exerciseSelectorOpen,
        setExerciseSelectorOpen,
        startNewWorkout,
        updateActiveWorkoutTitle,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSet,
        updateSet,
        toggleSetComplete,
        deleteSet,
        updateSuggestedTarget,
        applySuggestedTargetToSets,
        finishActiveWorkout,
        discardActiveWorkout,
        repeatWorkout,
        startRestTimer,
        pauseRestTimer,
        resetRestTimer,
        adjustRestTimer,
        dismissRestTimer,
        updateSettings,
        updateProfile,
        deleteHistoryItem,
        resetToSampleData,
        clearAllData,
        exportDataJson,
        importDataJson,
        stats: {
          totalWorkouts: history.length,
          currentStreak: streakInfo.currentStreak,
          totalVolume,
          totalPRsCount,
          thisWeekCount: streakInfo.thisWeekCount,
          completionPercentage,
        }
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
