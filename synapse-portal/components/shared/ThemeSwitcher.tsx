"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Zap, Cloud } from "lucide-react";
import { useIsMounted } from "@/lib/hooks";

const themes = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "midnight", icon: Moon, label: "Midnight" },
  { id: "arctic", icon: Cloud, label: "Arctic" },
  { id: "neon", icon: Zap, label: "Neon" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 rounded-full glass p-1 shadow-2xl">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-lg scale-110"
                : "text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-500"
            }`}
            title={t.label}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
