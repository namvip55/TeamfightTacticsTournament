"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem("dashboard-theme");
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      localStorage.setItem("dashboard-theme", "light");
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      localStorage.setItem("dashboard-theme", "dark");
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-all text-xs font-medium cursor-pointer light-theme:border-zinc-200 light-theme:bg-zinc-100 light-theme:text-zinc-800"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Giao diện Sáng</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-violet-400" />
          <span>Giao diện Tối</span>
        </>
      )}
    </button>
  );
}
