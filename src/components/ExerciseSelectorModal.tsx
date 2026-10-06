import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { EXERCISE_DATABASE } from '../data/exercises';
import { ExerciseDefinition, MuscleGroup, EquipmentType } from '../types/workout';
import { Search, X, Plus, Dumbbell, Shield, Flame, Activity } from 'lucide-react';

export const ExerciseSelectorModal: React.FC = () => {
  const { exerciseSelectorOpen, setExerciseSelectorOpen, addExerciseToWorkout, history, settings } = useWorkout();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'ALL'>('ALL');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<MuscleGroup>('CHEST');
  const [customEquipment, setCustomEquipment] = useState<EquipmentType>('Barbell');

  if (!exerciseSelectorOpen) return null;

  const categories: (MuscleGroup | 'ALL')[] = [
    'ALL',
    'CHEST',
    'BACK',
    'SHOULDERS',
    'BICEPS',
    'TRICEPS',
    'LEGS',
    'GLUTES',
    'CORE'
  ];

  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const matchesCategory = selectedCategory === 'ALL' || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPreviousPerformance = (exerciseId: string, exerciseName: string) => {
    for (const past of history) {
      const match = past.exercises.find(e => e.exerciseId === exerciseId || e.name.toLowerCase() === exerciseName.toLowerCase());
      if (match && match.sets.length > 0) {
        const completedSet = match.sets.find(s => s.completed && typeof s.weight === 'number' && typeof s.reps === 'number');
        if (completedSet) {
          return `${completedSet.weight} ${settings.unit.toUpperCase()} × ${completedSet.reps} reps`;
        }
      }
    }
    return null;
  };

  const handleSelect = (ex: ExerciseDefinition) => {
    addExerciseToWorkout(ex);
    setExerciseSelectorOpen(false);
    setSearch('');
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const customDef: ExerciseDefinition = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      equipment: customEquipment,
      defaultRestSeconds: 90
    };

    addExerciseToWorkout(customDef);
    setExerciseSelectorOpen(false);
    setIsCreatingCustom(false);
    setCustomName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight font-sans">EXERCISE LIBRARY</h2>
            <p className="text-xs text-[#8A9099] mt-0.5">Select a movement or configure custom exercise</p>
          </div>
          <button
            onClick={() => {
              setExerciseSelectorOpen(false);
              setIsCreatingCustom(false);
            }}
            className="w-8 h-8 rounded-xl bg-[#1C2026] hover:bg-white/10 flex items-center justify-center text-[#8A9099] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCreatingCustom ? (
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8A9099]" />
              <input
                type="text"
                placeholder="Search by name (e.g. Bench, Squat, Pull-up)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0D10] border border-white/[0.08] rounded-xl text-sm text-white placeholder-[#8A9099] focus:outline-none focus:border-[#B7FF00] transition-colors"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#B7FF00] text-[#0B0D10] shadow-neon-sm'
                      : 'bg-[#1C2026] border border-white/5 text-[#8A9099] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[350px] flex flex-col gap-2 pr-1">
              {filteredExercises.length === 0 ? (
                <div className="py-12 text-center text-[#8A9099] text-sm">
                  <p>No matching exercises found.</p>
                  <button
                    onClick={() => {
                      setCustomName(search);
                      setIsCreatingCustom(true);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B7FF00]/10 border border-[#B7FF00]/30 text-[#B7FF00] text-xs font-bold hover:bg-[#B7FF00]/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create "{search || 'Custom Lift'}"
                  </button>
                </div>
              ) : (
                filteredExercises.map(ex => {
                  const prevPerf = getPreviousPerformance(ex.id, ex.name);

                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleSelect(ex)}
                      className="w-full text-left p-3.5 rounded-2xl bg-[#1C2026]/90 hover:bg-[#1C2026] border border-white/[0.06] hover:border-[#B7FF00]/40 flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0B0D10] border border-white/5 flex items-center justify-center text-[#B7FF00] shrink-0">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-[#B7FF00] transition-colors">
                            {ex.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#8A9099] mt-0.5 font-mono">
                            <span>{ex.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{ex.equipment}</span>
                            {prevPerf && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#B7FF00] font-semibold">{prevPerf}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-[#0B0D10] border border-white/5 text-[11px] font-mono font-bold text-[#8A9099] group-hover:text-[#B7FF00] group-hover:border-[#B7FF00]/30 transition-all shrink-0">
                        + ADD
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Custom Exercise Action */}
            <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
              <span className="text-xs text-[#8A9099]">Looking for a unique movement?</span>
              <button
                onClick={() => setIsCreatingCustom(true)}
                className="px-3 py-1.5 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
              >
                <Plus className="w-3.5 h-3.5 text-[#B7FF00]" />
                Custom Lift
              </button>
            </div>
          </>
        ) : (
          /* Custom Exercise Form */
          <form onSubmit={handleCreateCustom} className="flex flex-col gap-4 py-2">
            <div>
              <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1 block">
                Exercise Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bulgarian Split Squat"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0D10] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#B7FF00]"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1 block">
                Target Muscle
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'LEGS', 'GLUTES', 'CORE'] as MuscleGroup[]).map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCustomCategory(cat)}
                    className={`py-2 text-[11px] font-mono font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      customCategory === cat
                        ? 'bg-[#B7FF00] border-[#B7FF00] text-[#0B0D10]'
                        : 'bg-[#0B0D10] border-white/5 text-[#8A9099] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1 block">
                Equipment Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'] as EquipmentType[]).map(eq => (
                  <button
                    type="button"
                    key={eq}
                    onClick={() => setCustomEquipment(eq)}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                      customEquipment === eq
                        ? 'bg-[#4D8DFF] border-[#4D8DFF] text-white shadow-blue-glow'
                        : 'bg-[#0B0D10] border-white/5 text-[#8A9099] hover:text-white'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="flex-1 py-3 rounded-xl bg-[#1C2026] hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Library
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#B7FF00] hover:bg-[#B7FF00]/90 text-[#0B0D10] text-xs font-black transition-all cursor-pointer shadow-neon-sm"
              >
                SAVE & ADD
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
