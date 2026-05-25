"use client";

import React from "react";

import {
  LayoutDashboard,
  Brain,
  ShieldCheck,
  Search,
  UserCircle2,
  Settings,
  Bell,
} from "lucide-react";
import Image from "next/image";
import NavItem from "@/components/shared/NavItem";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export default function Sidebar({
  userName = "Chief Architect",
  pendingCount = 0,
  isFullscreen = false,
}: {
  userName?: string;
  pendingCount?: number;
  isFullscreen?: boolean;
}) {
  const { t } = useI18n();

  return (
    <aside
      className={`z-40 flex w-64 flex-shrink-0 flex-col border-r border-white/5 glass-dark transition-all duration-500 ${
        isFullscreen ? "-ml-64" : "ml-0"
      }`}
    >
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-primary shadow-lg shadow-accent-primary/40">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-black leading-none tracking-tight text-dashboard-fg">
              Synapse<span className="text-accent-primary">.</span>
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Intelligence OS
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label={t("overview")}
          href="/dashboard"
        />
        <NavItem
          icon={<ShieldCheck size={18} />}
          label={t("the_gate")}
          badge={pendingCount}
          href="/gate"
        />
        <NavItem
          icon={<Search size={18} />}
          label={t("relevance_explorer")}
          href="/relevance"
        />
        <NavItem
          icon={<UserCircle2 size={18} />}
          label={t("agents_skills")}
          href="/agents"
        />
        <NavItem
          icon={<Settings size={18} />}
          label={t("settings")}
          href="/settings"
        />
      </nav>

      <div className="space-y-3 border-t border-white/5 p-4">
        <LanguageSwitcher />

        {/* User Profile Integration */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4 px-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-dashboard-bg/50">
              <Image
                src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${userName}`}
                width={32}
                height={32}
                alt="Avatar"
                unoptimized
              />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-[10px] font-black uppercase tracking-wider text-dashboard-fg">
                {userName}
              </p>
            </div>
          </div>
          <button className="relative p-1.5 text-slate-500 hover:text-accent-primary transition-colors">
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-primary" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
