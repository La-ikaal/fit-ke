import React, { useState, useEffect } from 'react';

// Types
type Tab = 'dashboard' | 'workouts' | 'weight' | 'blog';

interface Workout {
  id: string;
  name: string;
  durationMin: number;
  caloriesBurned: number;
}

interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
}

interface JournalEntry {
  id: string;
  title: string;
  milestone: string;
  content: string;
  imageUrl: string;
  date: string;
}

export default function FitnessDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Dashboard Stats States
  const [targetCalories, setTargetCalories] = useState<number>(500);
  
  // Persistent Water Intake State (saved to localStorage with today's date key)
  const todayKey = `water_intake_${new Date().toISOString().split('T')[0]}`;
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(todayKey);
      return saved !== null ? Number(saved) : 0;
    }
    return 0;
  });
  const maxWaterGlasses = 8;

  useEffect(() => {
    localStorage.setItem(todayKey, waterGlasses.toString());
  }, [waterGlasses, todayKey]);

  // Workouts States
  const [exercises, setExercises] = useState<Workout[]>([]);
  const [exerciseName, setExerciseName] = useState<string>('Jump Rope Intervals');
  const [customExerciseName, setCustomExerciseName] = useState<string>('');
  const [exerciseDuration, setExerciseDuration] = useState<number>(30);
  const [exerciseCalories, setExerciseCalories] = useState<number>(250);

  // Weight & Goals States
  const [goalWeight, setGoalWeight] = useState<number>(65);
  const [goalDate, setGoalDate] = useState<string>('2026-12-31');
  const [savedGoalWeight, setSavedGoalWeight] = useState<number>(65);
  const [savedGoalDate, setSavedGoalDate] = useState<string>('2026-12-31');
  const [currentWeightInput, setCurrentWeightInput] = useState<string>('');
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [editingWeightValue, setEditingWeightValue] = useState<string>('');

  // Blog & Journal States
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalMilestone, setJournalMilestone] = useState<string>('');
  const [journalContent, setJournalContent] = useState<string>('');
  const [journalImageUrl, setJournalImageUrl] = useState<string>('');

  // Quick action modal state for dashboard
  const [showQuickLogModal, setShowQuickLogModal] = useState<boolean>(false);
  const [quickLogType, setQuickLogType] = useState<'workout' | 'weight' | 'water'>('workout');
  const [quickWeightInput, setQuickWeightInput] = useState<string>('');

  // Computed totals
  const totalCaloriesBurned = exercises.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const calorieProgressPercent = Math.min(Math.round((totalCaloriesBurned / targetCalories) * 100), 100);

  // Handlers
  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = exerciseName === 'Custom' ? (customExerciseName || 'Custom Workout') : exerciseName;
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: finalName,
      durationMin: exerciseDuration,
      caloriesBurned: exerciseCalories,
    };
    setExercises([newWorkout, ...exercises]);
    setCustomExerciseName('');
  };

  const handleDurationChange = (val: number) => {
    setExerciseDuration(val);
    setExerciseCalories(val * 8); // approximate estimation
  };

  const saveGoalMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedGoalWeight(goalWeight);
    setSavedGoalDate(goalDate);
  };

  const addWeightLog = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(currentWeightInput);
    if (isNaN(val)) return;
    const newLog: WeightLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weightKg: val,
    };
    setWeightLogs([newLog, ...weightLogs]);
    setCurrentWeightInput('');
  };

  const updateWeightLog = (id: string) => {
    const val = parseFloat(editingWeightValue);
    if (isNaN(val)) return;
    setWeightLogs(weightLogs.map(item => item.id === id ? { ...item, weightKg: val } : item));
    setEditingWeightId(null);
  };

  const addJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: journalTitle,
      milestone: journalMilestone,
      content: journalContent,
      imageUrl: journalImageUrl,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setJournalEntries([newEntry, ...journalEntries]);
    setJournalTitle('');
    setJournalMilestone('');
    setJournalContent('');
    setJournalImageUrl('');
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickLogType === 'weight') {
      const val = parseFloat(quickWeightInput);
      if (!isNaN(val)) {
        setWeightLogs([{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], weightKg: val }, ...weightLogs]);
      }
    } else if (quickLogType === 'water') {
      if (waterGlasses < maxWaterGlasses) setWaterGlasses(waterGlasses + 1);
    } else if (quickLogType === 'workout') {
      setExercises([{ id: Date.now().toString(), name: 'Quick Interval Session', durationMin: 20, caloriesBurned: 160 }, ...exercises]);
    }
    setShowQuickLogModal(false);
    setQuickWeightInput('');
  };

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 bg-zinc-950 text-zinc-100 min-h-screen font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Header Navigation Tabs */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-50 flex items-center gap-2">
            ⚡ FitPulse <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Active Tracker</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Track your daily intervals, monitor milestones, and log progress.</p>
        </div>
        
        <nav className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'workouts' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Workouts
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'weight' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Weight & Goals
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === 'blog' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Journal ({journalEntries.length})
          </button>
        </nav>
      </header>

      {/* QUICK LOG MODAL OVERLAY */}
      {showQuickLogModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-zinc-100 font-bold text-base">Quick Action Log</h3>
              <button 
                onClick={() => setShowQuickLogModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs bg-zinc-800 px-2 py-1 rounded-lg cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="flex gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button 
                type="button" 
                onClick={() => setQuickLogType('workout')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${quickLogType === 'workout' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'}`}
              >
                Workout
              </button>
              <button 
                type="button" 
                onClick={() => setQuickLogType('weight')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${quickLogType === 'weight' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'}`}
              >
                Weight
              </button>
              <button 
                type="button" 
                onClick={() => setQuickLogType('water')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${quickLogType === 'water' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'}`}
              >
                Water
              </button>
            </div>

            <form onSubmit={handleQuickLogSubmit} className="space-y-3 pt-2">
              {quickLogType === 'weight' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Enter Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 67.2"
                    value={quickWeightInput}
                    onChange={(e) => setQuickWeightInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>
              )}
              {quickLogType === 'water' && (
                <p className="text-xs text-zinc-300 py-3 text-center">
                  Log 1 glass of water (+250ml) to your daily hydration total?
                </p>
              )}
              {quickLogType === 'workout' && (
                <p className="text-xs text-zinc-300 py-3 text-center">
                  Quick-add a standard 20-minute interval session (160 kcal)?
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Confirm & Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Quick Actions Bar */}
          <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Daily Overview</h2>
              <p className="text-xs text-zinc-400">Keep up the consistency today.</p>
            </div>
            <button
              onClick={() => setShowQuickLogModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>+ Quick Log</span>
            </button>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Calories Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-400">Active Calories</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold">{calorieProgressPercent}%</span>
              </div>
              <div>
                <div className="text-2xl font-black text-zinc-100">{totalCaloriesBurned} <span className="text-xs font-normal text-zinc-500">/ {targetCalories} kcal</span></div>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${calorieProgressPercent}%` }}></div>
              </div>
              <div className="pt-1 flex gap-2">
                <input 
                  type="number" 
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 w-24 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-zinc-500 self-center">Target Goal</span>
              </div>
            </div>

            {/* Workouts Completed Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-400">Workouts Logged</span>
                <span className="text-xs text-emerald-400 font-bold">⚡ Today</span>
              </div>
              <div>
                <div className="text-2xl font-black text-zinc-100">{exercises.length} <span className="text-xs font-normal text-zinc-500">sessions</span></div>
                <p className="text-xs text-zinc-400 mt-1">
                  {exercises.length === 0 ? 'No workouts logged yet.' : `${exercises.reduce((acc, curr) => acc + curr.durationMin, 0)} mins total duration.`}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('workouts')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold text-left transition cursor-pointer pt-2 border-t border-zinc-800/80"
              >
                Manage Workouts →
              </button>
            </div>

            {/* Hydration Tracker Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-400">Water Intake (Saved)</span>
                <span className="text-xs text-cyan-400 font-bold">{waterGlasses} / {maxWaterGlasses} glasses</span>
              </div>
              <div className="flex gap-1 py-1">
                {Array.from({ length: maxWaterGlasses }).map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)}
                    className={`flex-1 h-6 rounded-md cursor-pointer transition ${i < waterGlasses ? 'bg-cyan-500 shadow-sm' : 'bg-zinc-950 border border-zinc-800'}`}
                    title={`Glass ${i + 1}`}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-500">~{waterGlasses * 250} ml saved</span>
                <button 
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                  className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Reset / -1
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary & Goal Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-zinc-100">Target Milestone Status</h3>
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-zinc-400">Target Weight Goal</p>
                  <p className="text-lg font-black text-emerald-400">{savedGoalWeight} kg</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Deadline: {savedGoalDate}</p>
                </div>
                <button
                  onClick={() => setActiveTab('weight')}
                  className="text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg text-zinc-300 transition cursor-pointer"
                >
                  Update Goal
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-zinc-100">Latest Journal Reflection</h3>
              {journalEntries.length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center text-xs text-zinc-500">
                  No journal entries yet. <button onClick={() => setActiveTab('blog')} className="text-emerald-400 underline cursor-pointer">Write one</button>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-xs text-zinc-200">{journalEntries[0].title}</h4>
                    <span className="text-[10px] text-zinc-500">{journalEntries[0].date}</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{journalEntries[0].content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUTS */}
      {activeTab === 'workouts' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-200">Workout Logger & Session Tracker</h2>
          
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-zinc-100 font-bold text-sm">🔥 Log a New Workout</h3>
            <form onSubmit={handleWorkoutSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Workout Type</label>
                <select
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Jump Rope Intervals">Jump Rope Intervals</option>
                  <option value="Cardio Dance">Cardio Dance</option>
                  <option value="Lower Body Strength">Lower Body Strength</option>
                  <option value="Core & Abs Workout">Core & Abs Workout</option>
                  <option value="Bodyweight Training">Bodyweight Training</option>
                  <option value="Custom">Custom Workout...</option>
                </select>
              </div>

              {exerciseName === 'Custom' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Custom Workout Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HIIT Circuit"
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Duration (mins)</label>
                  <input 
                    type="number" 
                    value={exerciseDuration}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Calories Burned</label>
                  <input 
                    type="number" 
                    value={exerciseCalories}
                    onChange={(e) => setExerciseCalories(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Add Workout
              </button>
            </form>
          </div>

          {/* Logged Workouts List */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-zinc-100 font-bold text-sm">Today's Completed Workouts</h3>
            <div className="space-y-3">
              {exercises.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No workouts logged today. Time to get moving!
                </div>
              ) : (
                exercises.map((ex) => (
                  <div key={ex.id} className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-100">{ex.name}</h4>
                      <p className="text-xs text-zinc-400">{ex.durationMin} mins • ~{ex.caloriesBurned} kcal burned</p>
                    </div>
                    <button
                      onClick={() => setExercises(exercises.filter(item => item.id !== ex.id))}
                      className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEIGHT & GOALS */}
      {activeTab === 'weight' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-200">Weight Tracking & Target Milestones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Set Goal Form */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-zinc-100 font-bold text-sm">🎯 Target Milestone</h3>
              <form onSubmit={saveGoalMilestone} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalWeight}
                    onChange={(e) => setGoalWeight(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  Save Goal Target
                </button>
              </form>
              <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                Active Target: <strong className="text-emerald-400">{savedGoalWeight} kg</strong> by <strong className="text-emerald-400">{savedGoalDate}</strong>
              </p>
            </div>

            {/* Log Current Weight */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-zinc-100 font-bold text-sm">⚖️ Log Weight Check-in</h3>
              <form onSubmit={addWeightLog} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 68.5"
                    value={currentWeightInput}
                    onChange={(e) => setCurrentWeightInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  Add Weight Record
                </button>
              </form>
            </div>
          </div>

          {/* Weight Log History */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-zinc-100 font-bold text-sm">Weight History</h3>
            <div className="space-y-3">
              {weightLogs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No weight records logged yet.
                </div>
              ) : (
                weightLogs.map((w) => (
                  <div key={w.id} className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs text-zinc-400">{w.date}</p>
                      {editingWeightId === w.id ? (
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            step="0.1"
                            value={editingWeightValue}
                            onChange={(e) => setEditingWeightValue(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-100 w-24"
                          />
                          <button onClick={() => updateWeightLog(w.id)} className="text-xs bg-emerald-500 text-zinc-950 font-bold px-2 py-1 rounded">Save</button>
                        </div>
                      ) : (
                        <h4 className="font-bold text-sm text-zinc-100">{w.weightKg} kg</h4>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editingWeightId !== w.id && (
                        <button
                          onClick={() => { setEditingWeightId(w.id); setEditingWeightValue(String(w.weightKg)); }}
                          className="text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg transition cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => setWeightLogs(weightLogs.filter(item => item.id !== w.id))}
                        className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BLOG & JOURNAL */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-200">Fitness Journal & Reflections</h2>
          
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-zinc-100 font-bold text-sm">✍️ New Entry</h3>
            <form onSubmit={addJournalEntry} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Week 1 Reflections & Consistency"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Milestone (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Hit 5,000 skipping reps!"
                  value={journalMilestone}
                  onChange={(e) => setJournalMilestone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Content</label>
                <textarea
                  rows={4}
                  placeholder="Write your thoughts, meal adjustments, or fitness wins..."
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={journalImageUrl}
                  onChange={(e) => setJournalImageUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                Publish Entry
              </button>
            </form>
          </div>

          {/* Entries Stream */}
          <div className="space-y-4">
            {journalEntries.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                No journal entries published yet. Share your journey!
              </div>
            ) : (
              journalEntries.map((entry) => (
                <div key={entry.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-base text-zinc-100">{entry.title}</h3>
                    <span className="text-xs text-zinc-500">{entry.date}</span>
                  </div>
                  {entry.milestone && (
                    <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
                      🏆 {entry.milestone}
                    </div>
                  )}
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                  {entry.imageUrl && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800 max-h-64">
                      <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
                    <button
                      onClick={() => setJournalEntries(journalEntries.filter(item => item.id !== entry.id))}
                      className="text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    >
                      Delete Entry
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}