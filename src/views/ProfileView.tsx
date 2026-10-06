import React, { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { 
  User, 
  Settings, 
  Volume2, 
  VolumeX, 
  Timer, 
  Target, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Check, 
  ShieldCheck,
  Dumbbell,
  Moon,
  Bell,
  Award,
  Edit2,
  Mail
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    updateProfile,
    stats, 
    resetToSampleData, 
    clearAllData, 
    exportDataJson, 
    importDataJson 
  } = useWorkout();

  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(settings.profile.name || 'Pritam Kumar Sahu');
  const [email, setEmail] = useState(settings.profile.email || 'pritamkumarsahu7067@gmail.com');
  const [fitnessGoal, setFitnessGoal] = useState(settings.profile.fitnessGoal);
  const [experienceLevel, setExperienceLevel] = useState(settings.profile.experienceLevel);

  useEffect(() => {
    setName(settings.profile.name);
    setEmail(settings.profile.email || 'pritamkumarsahu7067@gmail.com');
    setFitnessGoal(settings.profile.fitnessGoal);
    setExperienceLevel(settings.profile.experienceLevel);
  }, [settings.profile]);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      fitnessGoal,
      experienceLevel,
    });
    setIsEditingProfile(false);
    showNotification('Profile and email updated successfully!');
  };

  const handleExport = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_gym_log_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Workout backup exported successfully!');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    const ok = importDataJson(importJson.trim());
    if (ok) {
      showNotification('Workout backup restored successfully!');
      setShowImport(false);
      setImportJson('');
    } else {
      alert('Invalid JSON structure. Please check backup data.');
    }
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase() || 'PS';
  };

  return (
    <div className="space-y-6 pb-28 md:pb-14 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-[10px] font-mono font-bold text-[#B7FF00] uppercase tracking-widest block mb-1">
          ATHLETE PROFILE & SETTINGS
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          LIFTER PROFILE
        </h1>
        <p className="text-xs text-[#8A9099] mt-0.5 font-medium">
          Manage your fitness goals, measurement units, rest timers, and data archives.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-[#B7FF00]/10 border border-[#B7FF00]/40 rounded-2xl text-[#B7FF00] text-xs font-bold font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Profile Avatar & Details Card */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B7FF00] to-emerald-500 text-[#0B0D10] font-black text-xl flex items-center justify-center shadow-neon-sm font-mono shrink-0">
              {getInitials(settings.profile.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{settings.profile.name}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#B7FF00]/10 border border-[#B7FF00]/30 text-[#B7FF00]">
                  {settings.profile.experienceLevel.toUpperCase()}
                </span>
              </div>
              {/* Display Email */}
              <div className="flex items-center gap-1.5 text-xs text-[#B7FF00] mt-0.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#B7FF00]" />
                <span>{settings.profile.email || 'pritamkumarsahu7067@gmail.com'}</span>
              </div>
              <p className="text-xs text-[#8A9099] mt-1 font-medium">
                Goal: <span className="text-white font-semibold">{settings.profile.fitnessGoal}</span>
              </p>
              <p className="text-[11px] font-mono text-[#8A9099] mt-0.5">
                Target: {settings.weeklyGoal} Training Days / Week
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="w-9 h-9 rounded-xl bg-[#1C2026] hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer border border-white/5"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Profile Edit Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-white/[0.06] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0D10] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#B7FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1 block">
                  Gmail / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pritamkumarsahu7067@gmail.com"
                  className="w-full px-3 py-2 bg-[#0B0D10] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#B7FF00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1 block">
                  Fitness Goal
                </label>
                <input
                  type="text"
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0D10] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#B7FF00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8A9099] uppercase tracking-wider mb-1 block">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 text-[11px] font-mono font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        experienceLevel === lvl
                          ? 'bg-[#B7FF00] border-[#B7FF00] text-[#0B0D10]'
                          : 'bg-[#0B0D10] border-white/5 text-[#8A9099]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 rounded-xl bg-[#1C2026] text-xs text-white font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#B7FF00] text-[#0B0D10] font-black text-xs font-mono cursor-pointer shadow-neon-sm"
              >
                SAVE CHANGES
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4 Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 text-center">
          <span className="text-[10px] font-mono font-bold text-[#8A9099] uppercase tracking-wider">TOTAL WORKOUTS</span>
          <div className="font-mono text-2xl font-black text-white mt-1.5">
            {stats.totalWorkouts}
          </div>
        </div>

        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 text-center">
          <span className="text-[10px] font-mono font-bold text-[#8A9099] uppercase tracking-wider">CURRENT STREAK</span>
          <div className="font-mono text-2xl font-black text-[#B7FF00] mt-1.5">
            {stats.currentStreak} 🔥
          </div>
        </div>

        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 text-center">
          <span className="text-[10px] font-mono font-bold text-[#8A9099] uppercase tracking-wider">TOTAL VOLUME</span>
          <div className="font-mono text-2xl font-black text-white mt-1.5">
            {stats.totalVolume > 99999 ? `${Math.round(stats.totalVolume / 1000)}k` : stats.totalVolume.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#15181D] border border-white/[0.08] rounded-[18px] p-4 text-center">
          <span className="text-[10px] font-mono font-bold text-[#8A9099] uppercase tracking-wider">RECORDS (PRS)</span>
          <div className="font-mono text-2xl font-black text-[#8B5CF6] mt-1.5">
            {stats.totalPRsCount} 🏆
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 space-y-5 shadow-xl">
        <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#B7FF00]" />
          <span>APP PREFERENCES</span>
        </h2>

        {/* Dark Mode Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C2026] flex items-center justify-center text-[#B7FF00]">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Theme Mode</span>
              <span className="text-xs text-[#8A9099]">Dark fitness aesthetic (Default: #0B0D10)</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#1C2026] text-xs font-mono font-bold text-[#B7FF00] border border-white/5">
            DARK ACTIVE
          </span>
        </div>

        {/* Units: KG / LB */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <span className="text-sm font-bold text-white block">Measurement Units</span>
            <span className="text-xs text-[#8A9099]">Kilograms (kg) or Pounds (lbs)</span>
          </div>
          <div className="flex bg-[#0B0D10] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => updateSettings({ unit: 'kg' })}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                settings.unit === 'kg' ? 'bg-[#B7FF00] text-[#0B0D10] shadow-neon-sm' : 'text-[#8A9099] hover:text-white'
              }`}
            >
              KG
            </button>
            <button
              onClick={() => updateSettings({ unit: 'lbs' })}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                settings.unit === 'lbs' ? 'bg-[#B7FF00] text-[#0B0D10] shadow-neon-sm' : 'text-[#8A9099] hover:text-white'
              }`}
            >
              LB
            </button>
          </div>
        </div>

        {/* Default Rest Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-[#B7FF00]" /> Default Rest Timer
            </span>
            <span className="text-xs text-[#8A9099]">Standard recovery duration between sets</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[30, 60, 90, 120, 180].map((sec) => (
              <button
                key={sec}
                onClick={() => updateSettings({ defaultRestSeconds: sec })}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  settings.defaultRestSeconds === sec
                    ? 'bg-[#B7FF00] border-[#B7FF00] text-[#0B0D10]'
                    : 'bg-[#1C2026] border-white/5 text-[#8A9099] hover:text-white'
                }`}
              >
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications / Sound Effects */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C2026] flex items-center justify-center text-[#B7FF00]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Notifications & Audio</span>
              <span className="text-xs text-[#8A9099]">Timer countdown beeps and PR victory fanfares</span>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              settings.soundEnabled ? 'bg-[#B7FF00]' : 'bg-[#1C2026]'
            }`}
          >
            <div
              className={`bg-[#0B0D10] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Weekly Training Days Goal */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#B7FF00]" /> Training Days / Week
            </span>
            <span className="text-xs text-[#8A9099]">Target gym sessions per calendar week</span>
          </div>
          <div className="flex items-center gap-1 bg-[#0B0D10] border border-white/10 rounded-xl p-1">
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => updateSettings({ weeklyGoal: num })}
                className={`w-8 h-8 text-xs font-mono font-black rounded-lg transition-all cursor-pointer ${
                  settings.weeklyGoal === num
                    ? 'bg-[#B7FF00] text-[#0B0D10]'
                    : 'text-[#8A9099] hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management & Reset Section */}
      <div className="bg-[#15181D] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B7FF00]" />
          <span>DATA MANAGEMENT</span>
        </h2>
        <p className="text-xs text-[#8A9099]">
          All workout routines, logs, and PR records are safely stored locally in your browser storage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            className="p-3.5 rounded-xl bg-[#1C2026] hover:bg-white/10 border border-white/5 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer font-mono"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#B7FF00]" />
              <span>EXPORT BACKUP JSON</span>
            </span>
            <span className="text-[#8A9099]">&rarr;</span>
          </button>

          <button
            onClick={() => setShowImport(!showImport)}
            className="p-3.5 rounded-xl bg-[#1C2026] hover:bg-white/10 border border-white/5 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer font-mono"
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#4D8DFF]" />
              <span>IMPORT BACKUP</span>
            </span>
            <span className="text-[#8A9099]">&rarr;</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Load starter sample workouts and PRs?')) {
                resetToSampleData();
                showNotification('Sample lifter data loaded!');
              }
            }}
            className="p-3.5 rounded-xl bg-[#1C2026] hover:bg-white/10 border border-white/5 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer font-mono"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>SAMPLE DATA RESET</span>
            </span>
            <span className="text-[#8A9099]">&rarr;</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data? This will clear all workouts and PRs.')) {
                clearAllData();
                showNotification('All workout data has been cleared.');
              }
            }}
            className="p-3.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-left flex items-center justify-between text-xs font-bold text-red-400 transition-all cursor-pointer font-mono"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>RESET DATA</span>
            </span>
            <span className="text-red-500">&rarr;</span>
          </button>
        </div>

        {/* Import JSON textarea */}
        {showImport && (
          <form onSubmit={handleImportSubmit} className="pt-3 border-t border-white/[0.06] space-y-3">
            <label className="text-xs font-bold text-white block">Paste Backup JSON</label>
            <textarea
              rows={4}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='{"history": [...], "prs": {...}}'
              className="w-full p-3 bg-[#0B0D10] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#8A9099] focus:outline-none focus:border-[#B7FF00]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#B7FF00] text-[#0B0D10] text-xs font-mono font-black cursor-pointer shadow-neon-sm"
              >
                RESTORE BACKUP
              </button>
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="px-4 py-2 rounded-xl bg-[#1C2026] text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
