export type MuscleGroup = 
  | 'CHEST' 
  | 'BACK' 
  | 'SHOULDERS' 
  | 'BICEPS' 
  | 'TRICEPS' 
  | 'LEGS' 
  | 'GLUTES' 
  | 'CORE';

export type EquipmentType = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight';
export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number | '';
  reps: number | '';
  completed: boolean;
  type: SetType;
  previous?: {
    weight: number;
    reps: number;
  };
}

export interface SmartProgressionTarget {
  weight: number;
  reps: string;
  explanation: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  targetMuscle: MuscleGroup;
  equipment: EquipmentType;
  notes?: string;
  suggestedTarget?: SmartProgressionTarget;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  id: string;
  title: string;
  startTime: number;
  notes?: string;
  exercises: WorkoutExercise[];
}

export interface PRRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  metric: 'weight' | 'reps' | 'volume';
  description: string;
  previousRecord?: string;
  date: string;
}

export interface CompletedWorkout {
  id: string;
  title: string;
  date: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  totalVolume: number; // in current unit (kg or lbs)
  totalSets: number;
  prsAchieved: PRRecord[];
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  maxWeightReps: number;
  maxReps: number;
  maxVolumeInSet: number;
  estimated1RM: number;
  lastUpdated: string;
  previousWeight?: number;
  previousReps?: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: MuscleGroup;
  equipment: EquipmentType;
  defaultRestSeconds: number;
  description?: string;
}

export interface WorkoutRoutineTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedDuration: number; // in minutes
  exercises: {
    exerciseId: string;
    sets: number;
    targetReps: number;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  fitnessGoal: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  trainingDays: number;
}

export interface UserSettings {
  unit: 'kg' | 'lbs';
  defaultRestSeconds: number;
  soundEnabled: boolean;
  autoTimerOnComplete: boolean;
  weeklyGoal: number; // e.g. 4 workouts
  profile: UserProfile;
}

export type TimeRangeFilter = '7D' | '30D' | '3M' | '1Y' | 'ALL';
