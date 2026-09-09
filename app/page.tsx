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
    const loadStorage = (key: string, setter: Function, fallback: any) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setter(JSON.parse(saved));
        } catch (e) {
          console.error(`Failed to parse ${key}`, e);
        }
      }
    };

    loadStorage("fit_ke_log", setLog, []);
    loadStorage("fit_ke_goals", setGoals, { calories: 2000, carbs: 220, protein: 130, fat: 65 });
    loadStorage("fit_ke_water", setWaterMl, 0);
    loadStorage("fit_ke_water_goal", setWaterGoal, 2500);
    loadStorage("fit_ke_exercises", setExercises, []);
    loadStorage("fit_ke_weights", setWeightLogs, []);
    loadStorage("fit_ke_goal_weight", setGoalWeight, 65);
    loadStorage("fit_ke_goal_date", setGoalDate, "2026-12-31");
    loadStorage("fit_ke_journal", setJournalEntries, []);
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

  const updateServings = (id: number, meal: string, delta: number) => {
    setLog(log.map((item) => {
      if (item.id === id && item.meal === meal) {
        const newServings = item.servings + delta;
        return newServings > 0 ? { ...item, servings: newServings } : null;
      }
      return item;
    }).filter(Boolean) as LoggedItem[]);
  };

  const deleteFood = (id: number, meal: string) => {
    setLog(log.filter((item) => !(item.id === id && item.meal === meal)));
  };

  const addExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    setExercises([...exercises, { id: Date.now(), name: exerciseName, durationMin: Number(exerciseDuration), caloriesBurned: Number(exerciseCalories) }]);
    setExerciseName("");
  };

  const deleteExercise = (id: number) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const addWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = Number(currentWeightInput);
    if (!wt) return;
    const today = new Date().toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });
    setWeightLogs([{ id: Date.now(), date: today, weightKg: wt }, ...weightLogs]);
    setCurrentWeightInput("");
  };

  const deleteWeight = (id: number) => {
    setWeightLogs(weightLogs.filter((w) => w.id !== id));
  };

  const saveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;
    const today = new Date().toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });
    setJournalEntries([{ id: Date.now(), date: today, title: journalTitle, content: journalContent }, ...journalEntries]);
    setJournalTitle("");
    setJournalContent("");
  };

  const deleteJournal = (id: number) => {
    setJournalEntries(journalEntries.filter((j) => j.id !== id));
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Main Navigation Tabs */}
        <header className="border-b border-zinc-800 pb-4 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
                Fit KE
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Local-first nutritional tracking, workouts, weight management, and personal reflections.
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
            {/* Daily Goals & Progress Section */}
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

                {log.length === 0 ? (
                  <div className="bg-zinc-800/20 border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
                    No foods logged yet. Choose a meal tab above and add items from the database.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2">
                    {MEAL_TYPES.map((mealType) => {
                      const mealItems = log.filter((item) => item.meal === mealType);
                      if (mealItems.length === 0) return null;
                      const mealCalories = mealItems.reduce((sum, i) => sum + i.calories * i.servings, 0);

                      return (
                        <div key={mealType} className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-center border-b border-zinc-700/50 pb-2">
                            <h3 className="font-semibold text-emerald-400 text-sm">{mealType}</h3>
                            <span className="text-xs text-zinc-400 font-medium">{mealCalories} kcal</span>
                          </div>
                          <div className="space-y-2">
                            {mealItems.map((item) => (
                              <div key={item.id} className="bg-zinc-800/80 border border-zinc-700/40 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-zinc-100 text-xs">{item.name}</h4>
                                  <p className="text-[11px] text-zinc-400 mt-0.5">{item.calories * item.servings} kcal ({item.servings} × {item.serving_unit})</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-1">
                                    <button onClick={() => updateServings(item.id, item.meal, -1)} className="w-6 h-6 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md font-bold flex items-center justify-center text-xs transition cursor-pointer">-</button>
                                    <span className="text-xs font-semibold w-4 text-center">{item.servings}</span>
                                    <button onClick={() => updateServings(item.id, item.meal, 1)} className="w-6 h-6 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md font-bold flex items-center justify-center text-xs transition cursor-pointer">+</button>
                                  </div>
                                  <button 
                                    onClick={() => deleteFood(item.id, item.meal)} 
                                    className="text-zinc-500 hover:text-rose-400 p-1 transition cursor-pointer text-xs"
                                    title="Delete item"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WATER & EXERCISE */}
        {activeTab === "fitness" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Water Tracker */}
            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-zinc-200">💧 Water Hydration</h2>
                <span className="text-sm font-bold text-sky-400">{waterMl} / {waterGoal} ml</span>
              </div>

              <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${getProgress(waterMl, waterGoal)}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <button onClick={() => setWaterMl(Math.max(0, waterMl + 250))} className="bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-zinc-700 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer">
                  +250 ml (Glass)
                </button>
                <button onClick={() => setWaterMl(Math.max(0, waterMl + 500))} className="bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-zinc-700 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer">
                  +500 ml (Bottle)
                </button>
                <button onClick={() => setWaterMl(0)} className="bg-zinc-800 hover:bg-rose-950/40 text-rose-400 border border-zinc-700 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer">
                  Reset
                </button>
              </div>
            </section>

            {/* Exercise Tracker */}
            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-zinc-200">🏃 Workout & Activity</h2>
                <span className="text-xs text-emerald-400 font-medium">Burned: {totalActiveCalories} kcal</span>
              </div>

              <form onSubmit={addExercise} className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Activity Name (e.g. Jump Rope, Cardio Dance)</label>
                  <input
                    type="text"
                    placeholder="Jump rope intervals..."
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Est. Calories Burned</label>
                    <input
                      type="number"
                      value={exerciseCalories}
                      onChange={(e) => setExerciseCalories(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition cursor-pointer">
                  + Log Exercise
                </button>
              </form>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {exercises.map((ex) => (
                  <div key={ex.id} className="bg-zinc-800/80 border border-zinc-700/50 p-3 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-semibold text-zinc-100">{ex.name}</h4>
                      <p className="text-zinc-400">{ex.durationMin} mins</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-emerald-400 font-bold">-{ex.caloriesBurned} kcal</span>
                      <button onClick={() => deleteExercise(ex.id)} className="text-zinc-500 hover:text-rose-400 transition cursor-pointer">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: WEIGHT & GOALS */}
        {activeTab === "weight" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-semibold text-zinc-200">⚖️ Weight Tracker & Targets</h2>
              
              <form onSubmit={addWeight} className="space-y-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 68.5"
                    value={currentWeightInput}
                    onChange={(e) => setCurrentWeightInput(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Goal Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={goalWeight}
                      onChange={(e) => setGoalWeight(Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Target Date</label>
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-xs transition cursor-pointer">
                  Save Weight Entry
                </button>
              </form>
            </section>

            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-zinc-200">Weight History</h2>
                <span className="text-xs text-emerald-400">Target: {goalWeight} kg by {goalDate}</span>
              </div>
              {weightLogs.length === 0 ? (
                <p className="text-xs text-zinc-500">No weight entries logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {weightLogs.map((log) => (
                    <div key={log.id} className="bg-zinc-800/80 border border-zinc-700/50 p-3 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="text-zinc-400 block">{log.date}</span>
                        <span className="text-emerald-400 font-bold text-sm">{log.weightKg} kg</span>
                      </div>
                      <button onClick={() => deleteWeight(log.id)} className="text-zinc-500 hover:text-rose-400 transition cursor-pointer">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: BLOG & JOURNAL */}
        {activeTab === "blog" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-zinc-200">✍️ Journal / Substack Draft</h2>
              <form onSubmit={saveJournal} className="space-y-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Title / Article Header</label>
                  <input
                    type="text"
                    placeholder="Reflections on fitness & routines..."
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Content / Essay Draft</label>
                  <textarea
                    rows={6}
                    placeholder="Write your thoughts here..."
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-xs transition cursor-pointer">
                  Save Entry
                </button>
              </form>
            </section>

            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-zinc-200">Saved Reflections</h2>
              {journalEntries.length === 0 ? (
                <p className="text-xs text-zinc-500">No journal entries saved yet.</p>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {journalEntries.map((entry) => (
                    <div key={entry.id} className="bg-zinc-800/80 border border-zinc-700/50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-zinc-100 text-sm">{entry.title}</h3>
                          <span className="text-[10px] text-zinc-500">{entry.date}</span>
                        </div>
                        <button onClick={() => deleteJournal(entry.id)} className="text-zinc-500 hover:text-rose-400 transition cursor-pointer text-xs">✕</button>
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

      </div>
    </main>
  );
}