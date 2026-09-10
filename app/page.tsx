"use client";

import React, { useState, useEffect } from "react";
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
  content: string;
}

const foodsData: FoodItem[] = Array.isArray(foodJson) 
  ? foodJson 
  : (foodJson as any).default || [];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"nutrition" | "fitness" | "weight" | "blog">("nutrition");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<typeof MEAL_TYPES[number]>("Breakfast");
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  
  // States
  const [log, setLog] = useState<LoggedItem[]>([]);
  const [goals, setGoals] = useState<Goals>({ calories: 2000, carbs: 220, protein: 130, fat: 65 });
  const [waterMl, setWaterMl] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState(30);
  const [exerciseCalories, setExerciseCalories] = useState(150);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [currentWeightInput, setCurrentWeightInput] = useState("");
  const [goalWeight, setGoalWeight] = useState(65);
  const [goalDate, setGoalDate] = useState("2026-12-31");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");

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
    loadStorage("fit_ke_goal_date", setGoalDate);
    loadStorage("fit_ke_journal", setJournalEntries);
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
    localStorage.setItem("fit_ke_goal_date", JSON.stringify(goalDate));
    localStorage.setItem("fit_ke_journal", JSON.stringify(journalEntries));
  }, [log, goals, waterMl, waterGoal, exercises, weightLogs, goalWeight, goalDate, journalEntries, mounted]);

  if (!mounted) return null;

  // Calculations
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

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {!isStarted ? (
          /* PAGE 1: The Landing View */
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-2xl my-auto">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span>✨ 100% Free Forever</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-100 leading-tight">
                  Fit KE: Your Ultimate <span className="text-emerald-400">Kenyan-First</span> Nutrition & Fitness Tracker
                </h1>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  Generic fitness apps don't know ugali, sukuma, or local meals. Track workouts, meals, and real life effortlessly.
                </p>
              </div>
              <button 
                onClick={() => setIsStarted(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                Start for Today →
              </button>
            </div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-hidden shadow-inner flex flex-col justify-center items-center text-center h-64 md:h-80 space-y-4">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-zinc-900/80 to-zinc-950"></div>
              <div className="relative z-10 space-y-3">
                <div className="w-16 h-16 bg-emerald-900/60 border border-emerald-700/60 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg">
                  🥘
                </div>
                <div>
                  <h3 className="text-zinc-100 font-bold text-base">Ugali, Sukuma & Real Goals</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
                    Accurately log local Kenyan meals, calculate macros, and hit your fitness targets effortlessly.
                  </p>
                </div>
              </div>
              <div className="relative z-10 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full">
                <span>✨ Designed for Mombasa & Beyond</span>
              </div>
            </div>
          </div>
        ) : (
          /* PAGE 2: Header, Navigation Tabs, and Tab Contents */
          <>
            <header className="border-b border-zinc-800 pb-4 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
                    Fit KE
                  </h1>
                  <p className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed mt-1">
                    Your ultimate Kenyan-first local nutrition and fitness tracking app.
                  </p>
                </div>
                {(log.length > 0 || waterMl > 0 || exercises.length > 0) && (
                  <button
                    onClick={() => { setLog([]); setWaterMl(0); setExercises([]); localStorage.clear(); }}
                    className="text-xs bg-zinc-800 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-300 border border-zinc-700 hover:border-rose-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Reset Day
                  </button>
                )}
              </div>

              {/* Navigation Bar */}
              <div className="flex bg-zinc-800/80 p-1.5 rounded-2xl gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("nutrition")}
                  className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "nutrition" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  🥗 Nutrition & Macros
                </button>
                <button
                  onClick={() => setActiveTab("fitness")}
                  className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "fitness" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  💧 Water & Exercise
                </button>
                <button
                  onClick={() => setActiveTab("weight")}
                  className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "weight" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  ⚖️ Weight & Goals
                </button>
                <button
                  onClick={() => setActiveTab("blog")}
                  className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === "blog" ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  ✍️ Blog & Journal
                </button>
              </div>
            </header>

            {/* TAB 1: NUTRITION & MACROS */}
            {activeTab === "nutrition" && (
              <div className="space-y-6">
                <section className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-6 space-y-5 shadow-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                      Daily Macro Targets {totalActiveCalories > 0 && <span className="text-emerald-400 lowercase font-normal">(Net: {netCalories} kcal after workouts)</span>}
                    </h2>
                    <button
                      onClick={() => setIsEditingGoals(!isEditingGoals)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer"
                    >
                      {isEditingGoals ? "Done Editing" : "Edit Targets"}
                    </button>
                  </div>

                  {isEditingGoals && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/80 p-4 rounded-xl border border-zinc-700">
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Calories (kcal)</label>
                        <input
                          type="number"
                          value={goals.calories}
                          onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={goals.carbs}
                          onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={goals.protein}
                          onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Fat (g)</label>
                        <input
                          type="number"
                          value={goals.fat}
                          onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Calories</span>
                        <span className="text-zinc-200"><strong className="text-emerald-400">{totalCalories}</strong> / {goals.calories}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${getProgress(totalCalories, goals.calories)}%` }} />
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Carbs</span>
                        <span className="text-zinc-200"><strong className="text-amber-400">{totalCarbs}</strong> / {goals.carbs}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${getProgress(totalCarbs, goals.carbs)}%` }} />
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Protein</span>
                        <span className="text-zinc-200"><strong className="text-sky-400">{totalProtein}</strong> / {goals.protein}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${getProgress(totalProtein, goals.protein)}%` }} />
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-zinc-400">Fat</span>
                        <span className="text-zinc-200"><strong className="text-rose-400">{totalFat}</strong> / {goals.fat}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${getProgress(totalFat, goals.fat)}%` }} />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Database */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-zinc-200">Food Database</h2>
                      <span className="text-xs text-zinc-400">Adding to: <strong className="text-emerald-400">{selectedMeal}</strong></span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search Kenyan foods, pilau, ugali, snacks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                      {foodsData.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((food) => (
                        <div key={food.id} className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-zinc-100">{food.name}</h3>
                              <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/50">
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
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
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
                    <h2 className="text-xl font-semibold text-zinc-200">Today's Meals</h2>
                    <div className="flex bg-zinc-800 p-1 rounded-xl">
                      {MEAL_TYPES.map((meal) => (
                        <button
                          key={meal}
                          onClick={() => setSelectedMeal(meal)}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition cursor-pointer ${
                            selectedMeal === meal ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {meal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WATER & EXERCISE */}
            {activeTab === "fitness" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-zinc-200">Water & Exercise Tracking</h2>
              </div>
            )}

            {/* TAB 3: WEIGHT & GOALS */}
            {activeTab === "weight" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-zinc-200">Weight & Goal Management</h2>
              </div>
            )}

            {/* TAB 4: BLOG & JOURNAL */}
            {activeTab === "blog" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-zinc-200">Blog & Personal Journal</h2>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}