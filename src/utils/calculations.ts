import { CompletedWorkout, PersonalRecord, SmartProgressionTarget, TimeRangeFilter } from '../types/workout';

// 1RM estimate using Epley Formula: w * (1 + r / 30)
export function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

// Smart progression target recommendation
export function calculateSmartProgression(
  prevWeight: number,
  prevReps: number,
  unit: 'kg' | 'lbs' = 'kg'
): SmartProgressionTarget {
  if (!prevWeight || prevWeight <= 0) {
    return {
      weight: unit === 'kg' ? 50 : 115,
      reps: '8–10 reps',
      explanation: 'Establish your initial baseline weight with controlled technique.',
    };
  }

  const weightStep = unit === 'kg' ? 2.5 : 5;
  const smallStep = unit === 'kg' ? 1.25 : 2.5;

  // If previous was 10 or more reps -> progressive overload: bump weight
  if (prevReps >= 10) {
    const nextWeight = Math.round((prevWeight + weightStep) * 10) / 10;
    return {
      weight: nextWeight,
      reps: '8–10 reps',
      explanation: `Target +${weightStep} ${unit} increase after hitting ${prevReps} reps in your last session.`,
    };
  }

  // If previous was 6 to 9 reps -> hold weight and add reps
  if (prevReps >= 6) {
    return {
      weight: prevWeight,
      reps: `${prevReps + 1}–${Math.min(12, prevReps + 2)} reps`,
      explanation: `Consolidate at ${prevWeight} ${unit} and push for +1–2 additional reps.`,
    };
  }

  // If previous was under 6 reps -> micro-load or maintain
  const nextWeight = Math.round((prevWeight + smallStep) * 10) / 10;
  return {
    weight: prevWeight,
    reps: '6–8 reps',
    explanation: `Build strength consistency at ${prevWeight} ${unit} before increasing load.`,
  };
}

// Format seconds into MM:SS
export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.max(0, totalSeconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format workout duration in minutes
export function formatDuration(durationMinutes: number): string {
  if (durationMinutes < 60) {
    return `${Math.max(1, Math.round(durationMinutes))}m`;
  }
  const hours = Math.floor(durationMinutes / 60);
  const mins = Math.round(durationMinutes % 60);
  return `${hours}h ${mins}m`;
}

// Plate calculator utility
export interface PlateBreakdown {
  plateWeight: number;
  countPerSide: number;
}

export function calculatePlates(
  totalWeight: number,
  unit: 'kg' | 'lbs' = 'kg',
  customBarWeight?: number
): {
  barWeight: number;
  weightPerSide: number;
  plates: PlateBreakdown[];
  achievedTotal: number;
  remainder: number;
} {
  const barWeight = customBarWeight ?? (unit === 'kg' ? 20 : 45);
  const availablePlates = unit === 'kg' 
    ? [25, 20, 15, 10, 5, 2.5, 1.25] 
    : [45, 35, 25, 10, 5, 2.5];

  if (totalWeight <= barWeight) {
    return {
      barWeight,
      weightPerSide: 0,
      plates: [],
      achievedTotal: barWeight,
      remainder: 0,
    };
  }

  let remainingPerSide = (totalWeight - barWeight) / 2;
  const plates: PlateBreakdown[] = [];

  for (const plate of availablePlates) {
    if (remainingPerSide >= plate) {
      const count = Math.floor(remainingPerSide / plate);
      plates.push({ plateWeight: plate, countPerSide: count });
      remainingPerSide -= count * plate;
    }
  }

  const platesTotalWeight = plates.reduce((acc, p) => acc + p.plateWeight * p.countPerSide * 2, 0);
  const achievedTotal = barWeight + platesTotalWeight;

  return {
    barWeight,
    weightPerSide: (achievedTotal - barWeight) / 2,
    plates,
    achievedTotal,
    remainder: Math.round((totalWeight - achievedTotal) * 10) / 10,
  };
}

// Filter workouts by time range
export function filterWorkoutsByTimeRange(workouts: CompletedWorkout[], range: TimeRangeFilter): CompletedWorkout[] {
  if (range === 'ALL') return workouts;
  const now = Date.now();
  let ms = 7 * 24 * 60 * 60 * 1000;

  if (range === '30D') ms = 30 * 24 * 60 * 60 * 1000;
  if (range === '3M') ms = 90 * 24 * 60 * 60 * 1000;
  if (range === '1Y') ms = 365 * 24 * 60 * 60 * 1000;

  const threshold = now - ms;
  return workouts.filter(w => new Date(w.date).getTime() >= threshold);
}

// Calculate streak in days
export function calculateStreak(history: CompletedWorkout[]): {
  currentStreak: number;
  lastWorkoutDate: string | null;
  thisWeekCount: number;
} {
  if (!history || history.length === 0) {
    return { currentStreak: 0, lastWorkoutDate: null, thisWeekCount: 0 };
  }

  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const uniqueDates = Array.from(new Set(sorted.map(w => w.date.split('T')[0]))).map(d => new Date(d));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const thisWeekCount = sorted.filter(w => {
    const wDate = new Date(w.date);
    return wDate >= monday;
  }).length;

  let streak = 0;
  const mostRecent = uniqueDates[0];
  mostRecent.setHours(0, 0, 0, 0);

  if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
    streak = 1;
    let checkDate = new Date(mostRecent);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      const diffTime = checkDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) {
        streak++;
        checkDate = prevDate;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak: streak,
    lastWorkoutDate: sorted[0]?.date || null,
    thisWeekCount,
  };
}

// Generate realistic starter data
export function getStarterWorkoutData(): {
  history: CompletedWorkout[];
  prs: Record<string, PersonalRecord>;
} {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const history: CompletedWorkout[] = [
    {
      id: 'hist_1',
      title: 'Push Day (Chest & Shoulders)',
      date: new Date(now - oneDay * 5).toISOString(),
      startTime: now - oneDay * 5 - 48 * 60 * 1000,
      endTime: now - oneDay * 5,
      durationMinutes: 48,
      totalVolume: 4320,
      totalSets: 14,
      prsAchieved: [
        {
          exerciseName: 'Barbell Bench Press',
          weight: 60,
          reps: 8,
          metric: 'weight',
          description: '60 KG × 8 REPS',
          previousRecord: '55 KG × 8 REPS',
          date: new Date(now - oneDay * 5).toISOString()
        }
      ],
      exercises: [
        {
          id: 'ex_1',
          exerciseId: 'bench_press',
          name: 'Barbell Bench Press',
          targetMuscle: 'CHEST',
          equipment: 'Barbell',
          sets: [
            { id: 's1', setNumber: 1, weight: 50, reps: 10, completed: true, type: 'warmup' },
            { id: 's2', setNumber: 2, weight: 55, reps: 10, completed: true, type: 'normal' },
            { id: 's3', setNumber: 3, weight: 60, reps: 8, completed: true, type: 'normal' },
            { id: 's4', setNumber: 4, weight: 60, reps: 6, completed: true, type: 'failure' },
          ]
        },
        {
          id: 'ex_2',
          exerciseId: 'db_shoulder_press',
          name: 'Seated Dumbbell Shoulder Press',
          targetMuscle: 'SHOULDERS',
          equipment: 'Dumbbell',
          sets: [
            { id: 's5', setNumber: 1, weight: 22, reps: 10, completed: true, type: 'normal' },
            { id: 's6', setNumber: 2, weight: 24, reps: 8, completed: true, type: 'normal' },
            { id: 's7', setNumber: 3, weight: 24, reps: 8, completed: true, type: 'normal' },
          ]
        }
      ]
    },
    {
      id: 'hist_2',
      title: 'Legs & Glutes Power',
      date: new Date(now - oneDay * 3).toISOString(),
      startTime: now - oneDay * 3 - 55 * 60 * 1000,
      endTime: now - oneDay * 3,
      durationMinutes: 55,
      totalVolume: 5850,
      totalSets: 15,
      prsAchieved: [
        {
          exerciseName: 'Barbell Back Squat',
          weight: 110,
          reps: 6,
          metric: 'weight',
          description: '110 KG × 6 REPS',
          previousRecord: '105 KG × 6 REPS',
          date: new Date(now - oneDay * 3).toISOString()
        }
      ],
      exercises: [
        {
          id: 'ex_3',
          exerciseId: 'barbell_squat',
          name: 'Barbell Back Squat',
          targetMuscle: 'LEGS',
          equipment: 'Barbell',
          sets: [
            { id: 's8', setNumber: 1, weight: 80, reps: 10, completed: true, type: 'warmup' },
            { id: 's9', setNumber: 2, weight: 100, reps: 8, completed: true, type: 'normal' },
            { id: 's10', setNumber: 3, weight: 110, reps: 6, completed: true, type: 'normal' },
          ]
        }
      ]
    },
    {
      id: 'hist_3',
      title: 'Pull Day (Back & Biceps)',
      date: new Date(now - oneDay * 1).toISOString(),
      startTime: now - oneDay * 1 - 44 * 60 * 1000,
      endTime: now - oneDay * 1,
      durationMinutes: 44,
      totalVolume: 4680,
      totalSets: 14,
      prsAchieved: [
        {
          exerciseName: 'Conventional Deadlift',
          weight: 140,
          reps: 5,
          metric: 'weight',
          description: '140 KG × 5 REPS',
          previousRecord: '135 KG × 5 REPS',
          date: new Date(now - oneDay * 1).toISOString()
        }
      ],
      exercises: [
        {
          id: 'ex_4',
          exerciseId: 'deadlift',
          name: 'Conventional Deadlift',
          targetMuscle: 'BACK',
          equipment: 'Barbell',
          sets: [
            { id: 's11', setNumber: 1, weight: 100, reps: 8, completed: true, type: 'warmup' },
            { id: 's12', setNumber: 2, weight: 130, reps: 6, completed: true, type: 'normal' },
            { id: 's13', setNumber: 3, weight: 140, reps: 5, completed: true, type: 'normal' },
          ]
        }
      ]
    }
  ];

  const prs: Record<string, PersonalRecord> = {
    'Barbell Bench Press': {
      exerciseName: 'Barbell Bench Press',
      maxWeight: 60,
      maxWeightReps: 8,
      maxReps: 12,
      maxVolumeInSet: 550,
      estimated1RM: 76,
      previousWeight: 55,
      previousReps: 8,
      lastUpdated: new Date(now - oneDay * 5).toISOString(),
    },
    'Barbell Back Squat': {
      exerciseName: 'Barbell Back Squat',
      maxWeight: 110,
      maxWeightReps: 6,
      maxReps: 10,
      maxVolumeInSet: 660,
      estimated1RM: 132,
      previousWeight: 105,
      previousReps: 6,
      lastUpdated: new Date(now - oneDay * 3).toISOString(),
    },
    'Conventional Deadlift': {
      exerciseName: 'Conventional Deadlift',
      maxWeight: 140,
      maxWeightReps: 5,
      maxReps: 8,
      maxVolumeInSet: 700,
      estimated1RM: 163.3,
      previousWeight: 135,
      previousReps: 5,
      lastUpdated: new Date(now - oneDay * 1).toISOString(),
    }
  };

  return { history, prs };
}
