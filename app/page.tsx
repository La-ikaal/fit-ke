"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import foodJson from "../data/food.json";

interface FoodItem {
  id: number;
  name: string;
  serving_unit: string;
  description: string;
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
}

interface LoggedItem extends FoodItem {
  servings: number;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
}

interface Goals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface ExerciseItem {
  id: number;
  name: string;
  durationMin: number;
  caloriesBurned: number;
}

interface WeightLog {
  id: number;
  date: string;
  weightKg: number;
}

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  milestone?: string;
  content: string;
  imageUrl?: string;
}

interface UserProfile {
  name: string;
  email?: string;
}

const COMMON_EXERCISES = [
  { name: "Jump rope intervals", ratePerMin: 10 },
  { name: "Brisk Walking", ratePerMin: 4 },
  { name: "Running / Jogging", ratePerMin: 9 },
  { name: "Dance cardio", ratePerMin: 6 },
  { name: "HIIT bodyweight", ratePerMin: 8 },
  { name: "Lower body strength", ratePerMin: 5 },
];

const foodsData: FoodItem[] = Array.isArray(foodJson)
  ? foodJson
  : (foodJson as any).default || [];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;

export default function Home() {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"nutrition" | "fitness" | "weight" | "blog">("nutrition");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<typeof MEAL_TYPES[number]>("Breakfast");
  const [isEditingGoals, setIsEditingGoals] = useState(false);

  // States
  const [log, setLog] = useState<LoggedItem[]>([]);
  const [goals, setGoals] = useState<Goals>({ calories: 2000, carbs: 220, protein: 130, fat: 65 });
  const [waterMl, setWaterMl] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);

  // Exercise States
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState<number>(30);
  const [exerciseCalories, setExerciseCalories] = useState<number>(150);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState(false);

  // Weight States
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [currentWeightInput, setCurrentWeightInput] = useState("");
  const [editingWeightId, setEditingWeightId] = useState<number | null>(null);
  const [editingWeightValue, setEditingWeightValue] = useState("");
  const [goalWeight, setGoalWeight] = useState<number>(65);
  const [goalDate, setGoalDate] = useState("2026-12-31");
  const [savedGoalWeight, setSavedGoalWeight] = useState<number>(65);
  const [savedGoalDate, setSavedGoalDate] = useState("2026-12-31");

  // Journal States
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalMilestone, setJournalMilestone] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalImageUrl, setJournalImageUrl] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);

    const loadStorage = (key: string, setter: Function) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setter(JSON.parse(saved));
        } catch (e) {
          console.error(`Failed to parse ${key}`, e);
        }
      }
    };

    loadStorage("fit_ke_log", setLog);
    loadStorage("fit_ke_goals", setGoals);
    loadStorage("fit_ke_water", setWaterMl);
    loadStorage("fit_ke_water_goal", setWaterGoal);
    loadStorage("fit_ke_exercises", setExercises);
    loadStorage("fit_ke_weights", setWeightLogs);
    loadStorage("fit_ke_goal_weight", setGoalWeight);
    loadStorage("fit_ke_saved_goal_weight", setSavedGoalWeight);
    loadStorage("fit_ke_goal_date", setGoalDate);
    loadStorage("fit_ke_saved_goal_date", setSavedGoalDate);
    loadStorage("fit_ke_journal", setJournalEntries);

    const savedProfile = localStorage.getItem("fit_ke_profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
        setIsStarted(true);
      } catch (e) {
        console.error("Failed to parse fit_ke_profile", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("fit_ke_log", JSON.stringify(log));
    localStorage.setItem("fit_ke_goals", JSON.stringify(goals));
    localStorage.setItem("fit_ke_water", JSON.stringify(waterMl));
    localStorage.setItem("fit_ke_water_goal", JSON.stringify(waterGoal));
    localStorage.setItem("fit_ke_exercises", JSON.stringify(exercises));
    localStorage.setItem("fit_ke_weights", JSON.stringify(weightLogs));
    localStorage.setItem("fit_ke_goal_weight", JSON.stringify(goalWeight));
    localStorage.setItem("fit_ke_saved_goal_weight", JSON.stringify(savedGoalWeight));
    localStorage.setItem("fit_ke_goal_date", JSON.stringify(goalDate));
    localStorage.setItem("fit_ke_saved_goal_date", JSON.stringify(savedGoalDate));
    localStorage.setItem("fit_ke_journal", JSON.stringify(journalEntries));
  }, [log, goals, waterMl, waterGoal, exercises, weightLogs, goalWeight, savedGoalWeight, goalDate, savedGoalDate, journalEntries, mounted]);

  if (!mounted) return null;

  // Nutrition Calculations (Untouched & Fully Working)
  const totalCalories = log.reduce((sum, item) => sum + item.calories * item.servings, 0);
  const totalCarbs = log.reduce((sum, item) => sum + item.carbs_g * item.servings, 0);
  const totalProtein = log.reduce((sum, item) => sum + item.protein_g * item.servings, 0);
  const totalFat = log.reduce((sum, item) => sum + item.fat_g * item.servings, 0);
  const totalActiveCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const netCalories = totalCalories - totalActiveCalories;

  const getProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const addFood = (food: FoodItem) => {
    const existing = log.find((item) => item.id === food.id && item.meal === selectedMeal);
    if (existing) {
      setLog(log.map((item) => item.id === food.id && item.meal === selectedMeal ? { ...item, servings: item.servings + 1 } : item));
    } else {
      setLog([...log, { ...food, servings: 1, meal: selectedMeal }]);
    }
  };

  const removeFood = (id: number, meal: string) => {
    setLog(log.filter(item => !(item.id === id && item.meal === meal)));
  };

  // Dynamic Exercise Logic based on time and name lookup
  const calculateCaloriesForExercise = (name: string, mins: number) => {
    const matched = COMMON_EXERCISES.find(ex => ex.name.toLowerCase() === name.toLowerCase());
    const rate = matched ? matched.ratePerMin : 5; // default 5 kcal/min
    return Math.round(mins * rate);
  };

  const handleExerciseNameChange = (val: string) => {
    setExerciseName(val);
    setShowExerciseSuggestions(true);
    setExerciseCalories(calculateCaloriesForExercise(val, exerciseDuration));
  };

  const handleDurationChange = (mins: number) => {
    setExerciseDuration(mins);
    setExerciseCalories(calculateCaloriesForExercise(exerciseName, mins));
  };

  const selectSuggestedExercise = (name: string) => {
    setExerciseName(name);
    setShowExerciseSuggestions(false);
    setExerciseCalories(calculateCaloriesForExercise(name, exerciseDuration));
  };

  const addExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    const newEx: ExerciseItem = {
      id: Date.now(),
      name: exerciseName,
      durationMin: Number(exerciseDuration),
      caloriesBurned: Number(exerciseCalories),
    };
    setExercises([newEx, ...exercises]);
    setExerciseName("");
    setExerciseDuration(30);
    setExerciseCalories(150);
  };

  // Weight Management Handlers
  const saveGoalMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedGoalWeight(goalWeight);
    setSavedGoalDate(goalDate);
  };

  const addWeightLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWeightInput) return;

    const newLog: WeightLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(currentWeightInput),
    };
    setWeightLogs([newLog, ...weightLogs]);
    setCurrentWeightInput("");
  };

  const updateWeightLog = (id: number) => {
    if (!editingWeightValue) return;
    setWeightLogs(weightLogs.map(w => w.id === id ? { ...w, weightKg: Number(editingWeightValue) } : w));
    setEditingWeightId(null);
    setEditingWeightValue("");
  };

  // Journal / Blog Handlers
  const addJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      title: journalTitle,
      milestone: journalMilestone.trim() ? journalMilestone.trim() : undefined,
      content: journalContent,
      imageUrl: journalImageUrl.trim() ? journalImageUrl.trim() : undefined,
    };
    setJournalEntries([newEntry, ...journalEntries]);
    setJournalTitle("");
    setJournalMilestone("");
    setJournalContent("");
    setJournalImageUrl("");
  };

  const handleLogout = () => {
    localStorage.removeItem("fit_ke_profile");
    setProfile(null);
    setIsStarted(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <div className="max-w-4xl mx-auto space-y-8">
        {!isStarted ? (
          /* PAGE 1: Landing View */
          <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-2xl shadow-emerald-950/20 my-auto">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                <span>✨ Start For Free</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-100 leading-tight">
                  Fit KE: Your Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Kenyan-First</span> Nutrition & Fitness Tracker
                </h1>
              
              </div>
              <button
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-extrabold px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Start Today →
              </button>
            </div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-hidden shadow-inner flex flex-col justify-center items-center text-center h-64 md:h-80 space-y-4">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-zinc-900/80 to-zinc-950"></div>
              <div className="relative z-10 space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg">
                  🥘
                </div>
                <div>
                  <h3 className="text-zinc-100 font-bold text-base">Real Meals & Real Goalss</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
                    Accurately track your local Kenyan meals and hit your fitness targets effortlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PAGE 2: Main Dashboard */
          <>
            <header className="border-b border-zinc-800/80 pb-4 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    Fit KE
                  </h1>
                  <p className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed mt-1">
                    Your ultimate Kenyan-first local nutrition and fitness tracking app.
                  </p>
                  {profile?.name && (
                    <p className="text-xs text-emerald-400 font-semibold mt-1">
                      Welcome back, {profile.name} 👋
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(log.length > 0 || waterMl > 0 || exercises.length > 0) && (
                    <button
                      onClick={() => { setLog([]); setWaterMl(0); setExercises([]); localStorage.clear(); }}
                      className="text-xs bg-zinc-900 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-900/50 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Reset Day
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </div>

              {/* Navigation Bar */}
              <div className="flex bg-zinc-900/90 border border-zinc-800/80 p-1.5 rounded-2xl gap-2 overflow-x-auto shadow-inner">
                <button
                  onClick={() => setActiveTab("nutrition")}
                  className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "nutrition" ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  🥗 Nutrition & Macros
                </button>
                <button
                  onClick={() => setActiveTab("fitness")}
                  className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "fitness" ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  💧 Water & Exercise
                </button>
                <button
                  onClick={() => setActiveTab("weight")}
                  className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "weight" ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  ⚖️ Weight & Goals
                </button>
                <button
                  onClick={() => setActiveTab("blog")}
                  className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "blog" ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  ✍️ Blog & Journal
                </button>
              </div>
            </header>

            {/* TAB 1: NUTRITION & MACROS (Preserved Fully) */}
            {activeTab === "nutrition" && (
              <div className="space-y-6">
                <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Daily Macro Targets {totalActiveCalories > 0 && <span className="text-emerald-400 lowercase font-normal">(Net: {netCalories} kcal after workouts)</span>}
                    </h2>
                    <button
                      onClick={() => setIsEditingGoals(!isEditingGoals)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition cursor-pointer"
                    >
                      {isEditingGoals ? "Done Editing" : "Edit Targets"}
                    </button>
                  </div>

                  {isEditingGoals && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Calories (kcal)</label>
                        <input
                          type="number"
                          value={goals.calories}
                          onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={goals.carbs}
                          onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={goals.protein}
                          onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Fat (g)</label>
                        <input
                          type="number"
                          value={goals.fat}
                          onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Calories</span>
                        <span className="text-zinc-200"><strong className="text-emerald-400">{totalCalories}</strong> / {goals.calories}</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${getProgress(totalCalories, goals.calories)}%` }} />
                      </div>
                    </div>
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Carbs</span>
                        <span className="text-zinc-200"><strong className="text-amber-400">{totalCarbs}</strong> / {goals.carbs}g</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${getProgress(totalCarbs, goals.carbs)}%` }} />
                      </div>
                    </div>
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Protein</span>
                        <span className="text-zinc-200"><strong className="text-sky-400">{totalProtein}</strong> / {goals.protein}g</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${getProgress(totalProtein, goals.protein)}%` }} />
                      </div>
                    </div>
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Fat</span>
                        <span className="text-zinc-200"><strong className="text-rose-400">{totalFat}</strong> / {goals.fat}g</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full transition-all duration-300" style={{ width: `${getProgress(totalFat, goals.fat)}%` }} />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Database */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-zinc-200">Food Database</h2>
                      <span className="text-xs text-zinc-400">Adding to: <strong className="text-emerald-400">{selectedMeal}</strong></span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search Kenyan foods, pilau, ugali, snacks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-inner"
                    />
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                      {foodsData.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((food) => (
                        <div key={food.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-zinc-100">{food.name}</h3>
                              <span className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                {food.serving_unit}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{food.description}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-800/80 text-xs">
                            <span className="text-zinc-300 font-medium">
                              {food.calories} kcal | C: {food.carbs_g}g | P: {food.protein_g}g | F: {food.fat_g}g
                            </span>
                            <button
                              onClick={() => addFood(food)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-sm"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meals Log */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-200">Today's Meals</h2>
                    <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                      {MEAL_TYPES.map((meal) => (
                        <button
                          key={meal}
                          onClick={() => setSelectedMeal(meal)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                            selectedMeal === meal ? "bg-emerald-500 text-zinc-950 font-bold shadow" : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {meal}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                      {log.filter(item => item.meal === selectedMeal).length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                          No foods logged for {selectedMeal} yet. Select items from the database!
                        </div>
                      ) : (
                        log.filter(item => item.meal === selectedMeal).map((item) => (
                          <div key={`${item.id}-${item.meal}`} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-sm text-zinc-100">{item.name}</h4>
                              <p className="text-xs text-zinc-400">
                                {item.servings} x {item.serving_unit} • {item.calories * item.servings} kcal
                              </p>
                            </div>
                            <button
                              onClick={() => removeFood(item.id, item.meal)}
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
              </div>
            )}

            {/* TAB 2: WATER & EXERCISE (With Autocomplete & Dynamic Time Scaling) */}
            {activeTab === "fitness" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-zinc-200">Water & Exercise Tracking</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Water Card */}
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-zinc-100 font-bold flex items-center gap-2">💧 Daily Water Intake</h3>
                      <span className="text-xs text-zinc-400">Goal: {waterGoal} ml</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-emerald-400 font-extrabold text-xl">{waterMl} ml</span>
                        <span className="text-xs text-zinc-400">{Math.round((waterMl / waterGoal) * 100)}% of daily target</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300" style={{ width: `${Math.min(100, (waterMl / waterGoal) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => setWaterMl(prev => prev + 250)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                      >
                        + 250ml Glass
                      </button>
                      <button
                        onClick={() => setWaterMl(prev => prev + 500)}
                        className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        + 500ml Bottle
                      </button>
                      <button
                        onClick={() => setWaterMl(0)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-medium px-3 py-2 rounded-xl text-xs transition ml-auto cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Exercise Log Form with Autocomplete */}
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-zinc-100 font-bold flex items-center gap-2">🏃‍♂️ Log Workout</h3>
                    <form onSubmit={addExercise} className="space-y-3 relative">
                      <div className="relative">
                        <label className="text-xs text-zinc-400 block mb-1">Workout Name</label>
                        <input
                          type="text"
                          placeholder="Type e.g. Jump rope, Run, Walk..."
                          value={exerciseName}
                          onChange={(e) => handleExerciseNameChange(e.target.value)}
                          onFocus={() => setShowExerciseSuggestions(true)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                        {/* Autocomplete Dropdown suggestions */}
                        {showExerciseSuggestions && (
                          <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                            {COMMON_EXERCISES.filter(item => item.name.toLowerCase().includes(exerciseName.toLowerCase())).map((item) => (
                              <div
                                key={item.name}
                                onClick={() => selectSuggestedExercise(item.name)}
                                className="px-3.5 py-2 text-xs text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer transition flex justify-between items-center"
                              >
                                <span>{item.name}</span>
                                <span className="text-[10px] text-zinc-500">~{item.ratePerMin} kcal/min</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Duration (min)</label>
                          <input
                            type="number"
                            min="1"
                            value={exerciseDuration}
                            onChange={(e) => handleDurationChange(Number(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Est. Calories Burned</label>
                          <input
                            type="number"
                            value={exerciseCalories}
                            onChange={(e) => setExerciseCalories(Number(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer mt-1"
                      >
                        Add Workout
                      </button>
                    </form>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-zinc-100 font-bold">Today's Workouts ({totalActiveCalories} kcal total burned)</h3>
                  <div className="space-y-3">
                    {exercises.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                        No workouts logged yet today. Keep moving!
                      </div>
                    ) : (
                      exercises.map((ex) => (
                        <div key={ex.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-sm text-zinc-100">{ex.name}</h4>
                            <p className="text-xs text-zinc-400">{ex.durationMin} mins • {ex.caloriesBurned} kcal burned</p>
                          </div>
                          <button
                            onClick={() => setExercises(exercises.filter(item => item.id !== ex.id))}
                            className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WEIGHT & GOALS (Simplified Save Target & Editable Entries) */}
            {activeTab === "weight" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-zinc-200">Weight & Goal Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Goal Configuration */}
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-zinc-100 font-bold">🎯 Target Milestone</h3>
                    <form onSubmit={saveGoalMilestone} className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Target Weight (kg)</label>
                        <input
                          type="number"
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
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                      >
                        Save
                      </button>
                    </form>
                    <div className="pt-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      Active Target: {savedGoalWeight} kg by {savedGoalDate}.
                    </div>
                  </div>

                  {/* Log Current Weight */}
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-zinc-100 font-bold">⚖️ Record Current Weight</h3>
                    <form onSubmit={addWeightLog} className="space-y-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Weight (kg)</label>
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
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>

                {/* Weight History with Inline Edit */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-zinc-100 font-bold">Weight History Log</h3>
                  <div className="space-y-3">
                    {weightLogs.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                        No weight entries recorded yet.
                      </div>
                    ) : (
                      weightLogs.map((w) => (
                        <div key={w.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-center">
                          <span className="text-xs text-zinc-400">{w.date}</span>
                          {editingWeightId === w.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.1"
                                value={editingWeightValue}
                                onChange={(e) => setEditingWeightValue(e.target.value)}
                                className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                              />
                              <button onClick={() => updateWeightLog(w.id)} className="text-xs bg-emerald-500 text-zinc-950 font-bold px-2 py-1 rounded">Save</button>
                              <button onClick={() => setEditingWeightId(null)} className="text-xs text-zinc-400 px-2 py-1">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-400 text-sm">{w.weightKg} kg</span>
                              <button
                                onClick={() => { setEditingWeightId(w.id); setEditingWeightValue(String(w.weightKg)); }}
                                className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setWeightLogs(weightLogs.filter(item => item.id !== w.id))}
                                className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BLOG & JOURNAL (Milestones, Pictures, Comments/Reflections) */}
            {activeTab === "blog" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-zinc-200">Blog & Personal Journal</h2>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-zinc-100 font-bold">✍️ Share Milestones & Reflections</h3>
                  <form onSubmit={addJournalEntry} className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Completed my first week strong!"
                        value={journalTitle}
                        onChange={(e) => setJournalTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Milestone Tag (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 5kg down / Hit water goal 7 days straight"
                        value={journalMilestone}
                        onChange={(e) => setJournalMilestone(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Photo URL (optional)</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={journalImageUrl}
                        onChange={(e) => setJournalImageUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Comments / Reflections</label>
                      <textarea
                        rows={4}
                        placeholder="Share your thoughts, feelings, or how your fitness journey is going..."
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
                    >
                      Publish Entry
                    </button>
                  </form>
                </div>

                {/* Journal Feed */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-zinc-200">Your Journal & Milestones Feed</h3>
                  {journalEntries.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
                      No journal entries yet. Share your first milestone or comment above!
                    </div>
                  ) : (
                    journalEntries.map((entry) => (
                      <div key={entry.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-zinc-100 text-base">{entry.title}</h4>
                            {entry.milestone && (
                              <span className="inline-block mt-1 text-[11px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                                🏆 Milestone: {entry.milestone}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            {entry.date}
                          </span>
                        </div>
                        {entry.imageUrl && (
                          <div className="overflow-hidden rounded-xl border border-zinc-800 max-h-80 bg-zinc-950">
                            <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
