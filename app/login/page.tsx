"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
type GoalType = "lose" | "maintain" | "gain";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

export default function LoginPage() {
  const router = useRouter();

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<Gender>("female");
  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(65);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");

  // Goal
  const [goalType, setGoalType] = useState<GoalType>("lose");
  const [targetWeight, setTargetWeight] = useState<number>(60);
  const [targetDate, setTargetDate] = useState<string>("2026-12-31");

  const [macrosTouched, setMacrosTouched] = useState(false);
  const [error, setError] = useState("");

  // Suggested daily calories via Mifflin-St Jeor, adjustable by activity + goal
  const suggestedCalories = useMemo(() => {
    const bmr =
      gender === "male"
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
    return Math.max(1200, Math.round((tdee + GOAL_ADJUSTMENTS[goalType]) / 10) * 10);
  }, [gender, weightKg, heightCm, age, activityLevel, goalType]);

  const suggestedMacros = useMemo(() => {
    const carbs = Math.round((suggestedCalories * 0.4) / 4);
    const protein = Math.round((suggestedCalories * 0.3) / 4);
    const fat = Math.round((suggestedCalories * 0.3) / 9);
    return { carbs, protein, fat };
  }, [suggestedCalories]);

  const [calories, setCalories] = useState<number>(suggestedCalories);
  const [carbs, setCarbs] = useState<number>(suggestedMacros.carbs);
  const [protein, setProtein] = useState<number>(suggestedMacros.protein);
  const [fat, setFat] = useState<number>(suggestedMacros.fat);

  // Keep macro fields synced to the suggestion until the user edits them manually
  React.useEffect(() => {
    if (!macrosTouched) {
      setCalories(suggestedCalories);
      setCarbs(suggestedMacros.carbs);
      setProtein(suggestedMacros.protein);
      setFat(suggestedMacros.fat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedCalories, suggestedMacros, macrosTouched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!heightCm || !weightKg || !age) {
      setError("Please fill in your age, height, and current weight.");
      return;
    }

    const profile = {
      name: name.trim(),
      email: email.trim() || undefined,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      goalType,
      createdAt: new Date().toISOString(),
    };

    const goals = { calories, carbs, protein, fat };

    localStorage.setItem("fit_ke_profile", JSON.stringify(profile));
    localStorage.setItem("fit_ke_goals", JSON.stringify(goals));
    localStorage.setItem("fit_ke_goal_weight", JSON.stringify(targetWeight));
    localStorage.setItem("fit_ke_saved_goal_weight", JSON.stringify(targetWeight));
    localStorage.setItem("fit_ke_goal_date", JSON.stringify(targetDate));
    localStorage.setItem("fit_ke_saved_goal_date", JSON.stringify(targetDate));

    // Seed the weight history with their starting weight
    const initialWeightLog = [
      {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        weightKg,
      },
    ];
    localStorage.setItem("fit_ke_weights", JSON.stringify(initialWeightLog));

    router.push("/");
  };

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500";
  const labelClass = "text-xs text-zinc-400 block mb-1";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <div className="w-full max-w-xl bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 md:p-10 space-y-6 shadow-2xl shadow-emerald-950/20 my-10">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
            <span>✨ 100% Free</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Build your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Fitness Profile
            </span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Tell us about yourself and your goal — we'll suggest daily targets you can fine-tune anytime. Everything stays on this device.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* About You */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">About You</h2>
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                placeholder="e.g. Wanjiru"
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>Email <span className="text-zinc-500">(optional)</span></label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Age</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className={inputClass}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className={inputClass}
              >
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                <option value="active">Active (exercise 6-7 days/week)</option>
              </select>
            </div>
          </section>

          {/* Your Goal */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Your Goal</h2>
            <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
              {(["lose", "maintain", "gain"] as GoalType[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoalType(g)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer capitalize ${
                    goalType === g ? "bg-emerald-500 text-zinc-950 shadow" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {g} weight
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Suggested Daily Targets */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Suggested Daily Targets
              </h2>
              {macrosTouched && (
                <button
                  type="button"
                  onClick={() => setMacrosTouched(false)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Reset to suggested
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => { setCalories(Number(e.target.value)); setMacrosTouched(true); }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => { setCarbs(Number(e.target.value)); setMacrosTouched(true); }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => { setProtein(Number(e.target.value)); setMacrosTouched(true); }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => { setFat(Number(e.target.value)); setMacrosTouched(true); }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              Based on your details — you can fine-tune these anytime from the Nutrition tab.
            </p>
          </section>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-extrabold px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            Start My Journey →
          </button>
        </form>
      </div>
    </main>
  );
}
