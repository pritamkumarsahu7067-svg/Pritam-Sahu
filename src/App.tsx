/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RestTimerBar } from './components/RestTimerBar';
import { PlateCalculatorModal } from './components/PlateCalculatorModal';
import { ExerciseSelectorModal } from './components/ExerciseSelectorModal';
import { FinishWorkoutModal } from './components/FinishWorkoutModal';
import { HomeView } from './views/HomeView';
import { WorkoutView } from './views/WorkoutView';
import { ProgressView } from './views/ProgressView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';

const MainContent: React.FC = () => {
  const { activeTab } = useWorkout();

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5">
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'workout' && <WorkoutView />}
      {activeTab === 'progress' && <ProgressView />}
      {activeTab === 'history' && <HistoryView />}
      {activeTab === 'profile' && <ProfileView />}
    </main>
  );
};

export default function App() {
  return (
    <WorkoutProvider>
      <div className="min-h-screen bg-[#0B0D10] text-white flex flex-col font-sans selection:bg-[#B7FF00]/20 selection:text-[#B7FF00]">
        {/* Navigation Top Bar Contract */}
        <Header />

        {/* Active Tab Main Content */}
        <MainContent />

        {/* Global Modals & Floating Overlays */}
        <RestTimerBar />
        <PlateCalculatorModal />
        <ExerciseSelectorModal />
        <FinishWorkoutModal />

        {/* Mobile Fixed Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </WorkoutProvider>
  );
}
