import React, { useState, useEffect } from 'react';

// Common exercises with average calorie burn rates per minute (for a baseline weight)
const COMMON_EXERCISES = [
  { name: 'Jump Rope', category: 'Cardio', burnRate: 11 },
  { name: 'Cardio Dance', category: 'Cardio', burnRate: 8 },
  { name: 'Bodyweight Squats', category: 'Lower Body', burnRate: 7 },
  { name: 'Abs Workout / Core', category: 'Strength', rank: 6 },
  { name: 'Push-ups & Planks', category: 'Upper Body', burnRate: 7.5 },
  { name: 'High-Intensity Interval Training (HIIT)', category: 'Cardio', burnRate: 12 },
  { name: 'Brisk Walking', category: 'Cardio', burnRate: 5 },
  { name: 'Jogging', category: 'Cardio', burnRate: 9 }
];

export default function FitnessApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for logs and metrics with localStorage persistence
  const [waterIntake, setWaterIntake] = useState(() => {
    return Number(localStorage.getItem('fit_ke_water')) || 0;
  });
  
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('fit_ke_workouts');
    return saved ? JSON.parse(saved) : [];
  });

  const [foodLog, setFoodLog] = useState(() => {
    const saved = localStorage.getItem('fit_ke_log');
    return saved ? JSON.parse(saved) : [];
  });

  // Exercise Form State
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('medium');

  // Save effects
  useEffect(() => {
    localStorage.setItem('fit_ke_water', waterIntake);
  }, [waterIntake]);

  useEffect(() => {
    localStorage.setItem('fit_ke_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('fit_ke_log', JSON.stringify(foodLog));
  }, [foodLog]);

  // Handle exercise search autocomplete
  const handleExerciseSearch = (e) => {
    const query = e.target.value;
    setExerciseQuery(query);
    if (query.trim() === '') {
      setFilteredExercises([]);
    } else {
      const matches = COMMON_EXERCISES.filter(ex => 
        ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredExercises(matches);
    }
  };

  const selectExercise = (ex) => {
    setSelectedExercise(ex);
    setExerciseQuery(ex.name);
    setFilteredExercises([]);
  };

  const handleAddExercise = () => {
    if (!exerciseQuery || !exerciseDuration) return;

    const matchedEx = COMMON_EXERCISES.find(ex => ex.name.toLowerCase() === exerciseQuery.toLowerCase());
    const burnRate = matchedEx ? matchedEx.burnRate : 7; // default burn rate
    
    // Intensity multiplier
    const intensityMultiplier = exerciseIntensity === 'high' ? 1.25 : exerciseIntensity === 'low' ? 0.8 : 1.0;
    const caloriesBurned = Math.round(burnRate * Number(exerciseDuration) * intensityMultiplier);

    const newWorkout = {
      id: Date.now(),
      name: exerciseQuery,
      duration: Number(exerciseDuration),
      intensity: exerciseIntensity,
      calories: caloriesBurned
    };

    setWorkouts([newWorkout, ...workouts]);
    setExerciseQuery('');
    setSelectedExercise(null);
    setExerciseDuration('');
  };

  // Calculate totals
  const totalCaloriesBurned = workouts.reduce((acc, curr) => acc + curr.calories, 0);
  const totalCaloriesConsumed = foodLog.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* App Header */}
      <header className="bg-emerald-700 text-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">FitKe Tracker</h1>
          <span className="text-xs bg-emerald-800 px-2.5 py-1 rounded-full font-medium">Home Routine Active</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-md mx-auto px-4 mt-4">
        <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'workouts' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Workouts
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 mt-4 space-y-4">
        {activeTab === 'dashboard' ? (
          <>
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 space-y-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Daily Balance</h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-xs text-slate-400">Consumed</span>
                  <span className="text-lg font-bold text-slate-700">{totalCaloriesConsumed}</span>
                  <span className="block text-[10px] text-slate-400">kcal</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <span className="block text-xs text-emerald-600">Burned</span>
                  <span className="text-lg font-bold text-emerald-700">{totalCaloriesBurned}</span>
                  <span className="block text-[10px] text-emerald-500">kcal</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-xs text-slate-400">Net</span>
                  <span className="text-lg font-bold text-slate-700">{netCalories}</span>
                  <span className="block text-[10px] text-slate-400">kcal</span>
                </div>
              </div>

              {/* Water Tracking */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-700">Water Intake</span>
                  <p className="text-xs text-slate-400">{waterIntake} ml logged today</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWaterIntake(Math.max(0, waterIntake - 250))}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setWaterIntake(waterIntake + 250)}
                    className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Workout Logger Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 space-y-4">
              <h2 className="font-semibold text-slate-800">Log Workout Routine</h2>
              
              <div className="relative">
                <label className="block text-xs font-medium text-slate-600 mb-1">Exercise Name</label>
                <input
                  type="text"
                  value={exerciseQuery}
                  onChange={handleExerciseSearch}
                  placeholder="e.g., Jump Rope, Cardio Dance..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                
                {/* Exercise Suggestions Dropdown */}
                {filteredExercises.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredExercises.map((ex) => (
                      <div
                        key={ex.name}
                        onClick={() => selectExercise(ex)}
                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 flex justify-between items-center"
                      >
                        <span>{ex.name}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{ex.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration & Intensity Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Intensity</label>
                  <select
                    value={exerciseIntensity}
                    onChange={(e) => setExerciseIntensity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddExercise}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Log Workout
              </button>
            </div>

            {/* Logged Workouts List */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-3">Today's Workouts</h3>
              {workouts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No workouts logged yet today. Time to move!</p>
              ) : (
                <div className="space-y-2.5">
                  {workouts.map((w) => (
                    <div key={w.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="block text-sm font-medium text-slate-700">{w.name}</span>
                        <span className="text-xs text-slate-400">{w.duration} mins • {w.intensity} intensity</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">-{w.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}