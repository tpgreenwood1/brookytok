"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  iconClassName?: string;
}

export function ThemeToggle({ className, iconClassName }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-9 h-9 rounded-full bg-surface",
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-full text-fg-muted hover:bg-surface hover:text-foreground transition-colors",
        className
      )}
    >
      {isDark ? (
        <Sun className={cn("w-4 h-4", iconClassName)} />
      ) : (
        <Moon className={cn("w-4 h-4", iconClassName)} />
      )}
    </button>
  );
}
