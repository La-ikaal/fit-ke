"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name to continue.");
      return;
    }

    const profile = {
      name: name.trim(),
      email: email.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("fit_ke_profile", JSON.stringify(profile));
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <div className="w-full max-w-md bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 md:p-10 space-y-6 shadow-2xl shadow-emerald-950/20">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
            <span>✨ 100% Free</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Let&apos;s get you{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              set up
            </span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Tell us your name so we can personalize your Fit KE dashboard. Everything stays on this device — no accounts, no passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Wanjiru"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Email <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-extrabold px-8 py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            Continue to Fit KE →
          </button>
        </form>
      </div>
    </main>
  );
}
