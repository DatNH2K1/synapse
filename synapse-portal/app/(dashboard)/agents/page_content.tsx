"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { Zap } from "lucide-react";

interface Agent {
  name: string;
  displayName: string;
  title: string;
  icon: string;
  capabilities: string;
  role: string;
}

interface Skill {
  canonicalId: string;
  name: string;
  description: string;
  module: string;
  path: string;
}

export default function AgentsPageContent({
  agents,
  skills,
}: {
  agents: Agent[];
  skills: Skill[];
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="space-y-8">
        <section>
          <h2 className="text-3xl font-black tracking-tight text-dashboard-fg uppercase italic">
            {t("agents_skills")}
            <span className="text-indigo-500">.</span>
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {t("agents_subtitle")}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="group relative rounded-2xl glass hover:bg-foreground/5 p-6 transition-all"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-2xl">
                  {agent.icon}
                </div>
                <div>
                  <h4 className="text-lg font-black tracking-tight text-dashboard-fg leading-none">
                    {agent.displayName}
                  </h4>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                    {agent.title}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                {agent.role}
              </p>

              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                  {t("capabilities")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities
                    .split(",")
                    .slice(0, 4)
                    .map((cap) => (
                      <span
                        key={cap}
                        className="rounded-md bg-foreground/5 px-2 py-0.5 text-[9px] font-bold text-slate-500"
                      >
                        {cap.trim()}
                      </span>
                    ))}
                  {agent.capabilities.split(",").length > 4 && (
                    <span className="text-[9px] font-bold text-slate-600 px-1">
                      {t("more", {
                        count: agent.capabilities.split(",").length - 4,
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <section>
          <h2 className="text-2xl font-black tracking-tight text-dashboard-fg uppercase italic">
            {t("technical_skills")}
            <span className="text-emerald-500">.</span>
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {t("skills_subtitle")}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.canonicalId}
              className="flex items-start gap-4 rounded-xl glass hover:bg-foreground/5 p-4 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-500">
                <Zap size={20} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-dashboard-fg">
                    {skill.name}
                  </h4>
                  <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-slate-500">
                    {skill.module}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {skill.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
