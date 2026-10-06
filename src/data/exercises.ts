import { ExerciseDefinition, WorkoutRoutineTemplate } from '../types/workout';

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // CHEST
  { id: 'bench_press', name: 'Barbell Bench Press', category: 'CHEST', equipment: 'Barbell', defaultRestSeconds: 120 },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press', category: 'CHEST', equipment: 'Dumbbell', defaultRestSeconds: 90 },
  { id: 'cable_crossover', name: 'Cable Chest Flyes', category: 'CHEST', equipment: 'Cable', defaultRestSeconds: 75 },
  { id: 'dips_chest', name: 'Chest Dips', category: 'CHEST', equipment: 'Bodyweight', defaultRestSeconds: 90 },
  { id: 'push_ups', name: 'Push-Ups', category: 'CHEST', equipment: 'Bodyweight', defaultRestSeconds: 60 },
  { id: 'machine_chest_press', name: 'Machine Chest Press', category: 'CHEST', equipment: 'Machine', defaultRestSeconds: 90 },
  { id: 'pec_deck_fly', name: 'Pec Deck Machine Fly', category: 'CHEST', equipment: 'Machine', defaultRestSeconds: 75 },

  // BACK
  { id: 'deadlift', name: 'Conventional Deadlift', category: 'BACK', equipment: 'Barbell', defaultRestSeconds: 180 },
  { id: 'barbell_row', name: 'Barbell Bent-Over Row', category: 'BACK', equipment: 'Barbell', defaultRestSeconds: 100 },
  { id: 'pull_ups', name: 'Pull-Ups', category: 'BACK', equipment: 'Bodyweight', defaultRestSeconds: 90 },
  { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'BACK', equipment: 'Cable', defaultRestSeconds: 75 },
  { id: 'seated_cable_row', name: 'Seated Cable Row', category: 'BACK', equipment: 'Cable', defaultRestSeconds: 75 },
  { id: 'single_arm_db_row', name: 'Single-Arm Dumbbell Row', category: 'BACK', equipment: 'Dumbbell', defaultRestSeconds: 75 },
  { id: 't_bar_row', name: 'T-Bar Row', category: 'BACK', equipment: 'Barbell', defaultRestSeconds: 90 },

  // SHOULDERS
  { id: 'overhead_press', name: 'Overhead Barbell Press', category: 'SHOULDERS', equipment: 'Barbell', defaultRestSeconds: 120 },
  { id: 'db_shoulder_press', name: 'Seated Dumbbell Shoulder Press', category: 'SHOULDERS', equipment: 'Dumbbell', defaultRestSeconds: 90 },
  { id: 'lateral_raise', name: 'Dumbbell Lateral Raise', category: 'SHOULDERS', equipment: 'Dumbbell', defaultRestSeconds: 60 },
  { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', category: 'SHOULDERS', equipment: 'Cable', defaultRestSeconds: 60 },
  { id: 'face_pull', name: 'Cable Face Pulls', category: 'SHOULDERS', equipment: 'Cable', defaultRestSeconds: 60 },
  { id: 'rear_delt_fly', name: 'Rear Delt Machine Fly', category: 'SHOULDERS', equipment: 'Machine', defaultRestSeconds: 60 },
  { id: 'arnold_press', name: 'Arnold Dumbbell Press', category: 'SHOULDERS', equipment: 'Dumbbell', defaultRestSeconds: 90 },

  // BICEPS
  { id: 'barbell_curl', name: 'Barbell Bicep Curl', category: 'BICEPS', equipment: 'Barbell', defaultRestSeconds: 60 },
  { id: 'incline_db_curl', name: 'Incline Dumbbell Curl', category: 'BICEPS', equipment: 'Dumbbell', defaultRestSeconds: 60 },
  { id: 'hammer_curl', name: 'Dumbbell Hammer Curl', category: 'BICEPS', equipment: 'Dumbbell', defaultRestSeconds: 60 },
  { id: 'preacher_curl', name: 'EZ-Bar Preacher Curl', category: 'BICEPS', equipment: 'Barbell', defaultRestSeconds: 75 },
  { id: 'cable_bicep_curl', name: 'Cable Bicep Curl', category: 'BICEPS', equipment: 'Cable', defaultRestSeconds: 60 },

  // TRICEPS
  { id: 'tricep_rope_pushdown', name: 'Cable Tricep Rope Pushdown', category: 'TRICEPS', equipment: 'Cable', defaultRestSeconds: 60 },
  { id: 'skull_crushers', name: 'Barbell Skull Crushers', category: 'TRICEPS', equipment: 'Barbell', defaultRestSeconds: 75 },
  { id: 'overhead_tricep_ext', name: 'Overhead Dumbbell Tricep Extension', category: 'TRICEPS', equipment: 'Dumbbell', defaultRestSeconds: 60 },
  { id: 'tricep_straight_bar', name: 'Straight-Bar Cable Pushdown', category: 'TRICEPS', equipment: 'Cable', defaultRestSeconds: 60 },
  { id: 'dips_tricep', name: 'Bench Tricep Dips', category: 'TRICEPS', equipment: 'Bodyweight', defaultRestSeconds: 60 },

  // LEGS
  { id: 'barbell_squat', name: 'Barbell Back Squat', category: 'LEGS', equipment: 'Barbell', defaultRestSeconds: 150 },
  { id: 'front_squat', name: 'Front Squat', category: 'LEGS', equipment: 'Barbell', defaultRestSeconds: 120 },
  { id: 'leg_press', name: '45° Leg Press', category: 'LEGS', equipment: 'Machine', defaultRestSeconds: 90 },
  { id: 'leg_extension', name: 'Leg Extensions', category: 'LEGS', equipment: 'Machine', defaultRestSeconds: 60 },
  { id: 'lying_leg_curl', name: 'Lying Hamstring Curl', category: 'LEGS', equipment: 'Machine', defaultRestSeconds: 60 },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift (RDL)', category: 'LEGS', equipment: 'Barbell', defaultRestSeconds: 100 },
  { id: 'standing_calf_raise', name: 'Standing Calf Raise', category: 'LEGS', equipment: 'Machine', defaultRestSeconds: 60 },

  // GLUTES
  { id: 'barbell_hip_thrust', name: 'Barbell Hip Thrust', category: 'GLUTES', equipment: 'Barbell', defaultRestSeconds: 120 },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', category: 'GLUTES', equipment: 'Dumbbell', defaultRestSeconds: 90 },
  { id: 'cable_glute_kickback', name: 'Cable Glute Kickbacks', category: 'GLUTES', equipment: 'Cable', defaultRestSeconds: 60 },
  { id: 'glute_bridge', name: 'Weighted Glute Bridge', category: 'GLUTES', equipment: 'Barbell', defaultRestSeconds: 75 },

  // CORE
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', category: 'CORE', equipment: 'Bodyweight', defaultRestSeconds: 60 },
  { id: 'cable_woodchopper', name: 'Cable Woodchopper', category: 'CORE', equipment: 'Cable', defaultRestSeconds: 45 },
  { id: 'ab_wheel_rollout', name: 'Ab Wheel Rollout', category: 'CORE', equipment: 'Bodyweight', defaultRestSeconds: 60 },
  { id: 'plank', name: 'Weighted Plank Hold', category: 'CORE', equipment: 'Bodyweight', defaultRestSeconds: 60 },
  { id: 'cable_crunch', name: 'Cable Kneeling Crunch', category: 'CORE', equipment: 'Cable', defaultRestSeconds: 60 }
];

export const WORKOUT_TEMPLATES: WorkoutRoutineTemplate[] = [
  {
    id: 'push_day',
    name: 'Push Day (Chest & Shoulders)',
    category: 'Hypertrophy Split',
    description: 'Target your pressing muscles with progressive overload compound lifts and isolation burnout.',
    estimatedDuration: 55,
    exercises: [
      { exerciseId: 'bench_press', sets: 4, targetReps: 8 },
      { exerciseId: 'incline_db_press', sets: 3, targetReps: 10 },
      { exerciseId: 'db_shoulder_press', sets: 3, targetReps: 10 },
      { exerciseId: 'lateral_raise', sets: 4, targetReps: 15 },
      { exerciseId: 'tricep_rope_pushdown', sets: 3, targetReps: 12 },
    ]
  },
  {
    id: 'pull_day',
    name: 'Pull Day (Back & Biceps)',
    category: 'Hypertrophy Split',
    description: 'Build back thickness and width with deadlifts, heavy rows, and arms isolation.',
    estimatedDuration: 50,
    exercises: [
      { exerciseId: 'deadlift', sets: 3, targetReps: 5 },
      { exerciseId: 'pull_ups', sets: 3, targetReps: 8 },
      { exerciseId: 'barbell_row', sets: 3, targetReps: 8 },
      { exerciseId: 'face_pull', sets: 4, targetReps: 15 },
      { exerciseId: 'barbell_curl', sets: 3, targetReps: 10 },
    ]
  },
  {
    id: 'legs_day',
    name: 'Legs & Glutes Power',
    category: 'Hypertrophy Split',
    description: 'Heavy squat foundation followed by Romanian deadlifts, split squats, and calf work.',
    estimatedDuration: 60,
    exercises: [
      { exerciseId: 'barbell_squat', sets: 4, targetReps: 6 },
      { exerciseId: 'romanian_deadlift', sets: 3, targetReps: 8 },
      { exerciseId: 'barbell_hip_thrust', sets: 3, targetReps: 10 },
      { exerciseId: 'leg_extension', sets: 3, targetReps: 12 },
      { exerciseId: 'standing_calf_raise', sets: 4, targetReps: 15 },
    ]
  },
  {
    id: 'upper_power',
    name: 'Upper Body Power',
    category: 'Strength & Power',
    description: 'Balanced upper body strength session hitting both horizontal and vertical pushes and pulls.',
    estimatedDuration: 48,
    exercises: [
      { exerciseId: 'bench_press', sets: 4, targetReps: 6 },
      { exerciseId: 'barbell_row', sets: 4, targetReps: 6 },
      { exerciseId: 'overhead_press', sets: 3, targetReps: 8 },
      { exerciseId: 'lat_pulldown', sets: 3, targetReps: 10 },
      { exerciseId: 'skull_crushers', sets: 3, targetReps: 10 },
    ]
  }
];
