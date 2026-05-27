"use client";

import React, { useState } from "react";
import {
  Database,
  Palette,
  Tag as TagIcon,
  Brain,
  Sliders,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Tag } from "@/lib/db";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Avatar from "@/components/shared/Avatar";

export default function SettingsPageContent({
  config,
  tags,
  aiConfig,
  systemConfig: initialSystemConfig,
}: {
  config: { user_name: string };
  tags: Tag[];
  aiConfig: {
    gemini: { model: string; embedding_model: string; is_active: boolean };
    stitch: { is_set: boolean };
    context7: { is_set: boolean };
  };
  systemConfig: Record<string, string>;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const [systemConfig, setSystemConfig] =
    useState<Record<string, string>>(initialSystemConfig);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [similarityVal, setSimilarityVal] = useState(
    parseFloat(initialSystemConfig.rem_similarity_threshold || "0.85"),
  );
  const [confidenceVal, setConfidenceVal] = useState(
    parseFloat(initialSystemConfig.rem_confidence_threshold || "0.90"),
  );

  const [prevConfig, setPrevConfig] = useState(systemConfig);
  if (systemConfig !== prevConfig) {
    setPrevConfig(systemConfig);
    setSimilarityVal(
      parseFloat(systemConfig.rem_similarity_threshold || "0.85"),
    );
    setConfidenceVal(
      parseFloat(systemConfig.rem_confidence_threshold || "0.90"),
    );
  }

  const handleUpdateConfig = async (key: string, value: string) => {
    setSavingKey(key);
    // Optimistic UI update
    setSystemConfig((prev) => ({ ...prev, [key]: value }));

    try {
      const res = await fetch("/api/system-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        setSystemConfig(initialSystemConfig);
        alert("Failed to save configuration");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Save config error:", error);
      setSystemConfig(initialSystemConfig);
      alert("Failed to save configuration");
    } finally {
      setSavingKey(null);
    }
  };

  const handleUpdateColor = async (tagId: string, color: string) => {
    setIsSaving(tagId);
    try {
      const res = await fetch("/api/visual-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tagId, color }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section>
        <h2 className="text-3xl font-black tracking-tight text-dashboard-fg uppercase italic">
          {t("system_settings")}
          <span className="text-indigo-500">.</span>
        </h2>
        <p className="text-xs font-medium text-slate-500">
          {t("settings_subtitle")}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          {/* 1. Identity Profile - Compact */}
          <div className="rounded-2xl glass p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500/20 bg-slate-800 p-1 shadow-xl">
                <Avatar
                  seed={config.user_name}
                  width={48}
                  height={48}
                />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                <div className="truncate">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-600 uppercase mb-0.5">
                    {t("identity_profile")}
                  </h4>
                  <p className="text-lg font-bold text-dashboard-fg tracking-tight truncate">
                    {config.user_name}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <div className="px-2 py-0.5 rounded-full bg-slate-500/5 border border-white/10 text-[8px] font-black uppercase text-slate-500">
                    {t("local_access")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI Infrastructure - Primary Status */}
          <div className="rounded-2xl glass p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
                <Brain size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight text-dashboard-fg uppercase">
                  {t("ai_infrastructure")}
                </h4>
                <p className="text-xs text-slate-500">
                  {t("ai_provider_status")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {t("gemini_model")}
                  </p>
                  <p className="text-sm font-bold text-dashboard-fg min-h-[1.25rem]">
                    {aiConfig.gemini.model || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {t("gemini_embedding_model")}
                  </p>
                  <p className="text-sm font-bold text-dashboard-fg min-h-[1.25rem]">
                    {aiConfig.gemini.embedding_model || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  {
                    label: t("stitch_api"),
                    isSet: aiConfig.stitch.is_set,
                    className: "",
                  },
                  {
                    label: t("context7_api"),
                    isSet: aiConfig.context7.is_set,
                    className: "",
                  },
                  {
                    label: t("gemini_api"),
                    isSet: aiConfig.gemini.is_active,
                    className: "",
                  },
                ].map((api) => (
                  <div
                    key={api.label}
                    className={`flex items-center justify-between ${api.className || ""}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {api.label}
                    </p>
                    <div
                      className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase transition-all duration-500 ${
                        api.isSet
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}
                    >
                      {api.isSet ? t("set") : t("not_set")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2.5. Agent Co-Pilot & Self-Regulation - Premium Settings */}
          <div className="rounded-2xl glass p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
                <Sliders size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-black tracking-tight text-dashboard-fg uppercase">
                  {t("agent_co_pilot")}
                </h4>
                <p className="text-xs text-slate-500">
                  {t("settings_subtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* REM Sleep Switch */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-foreground/5 border border-white/5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-dashboard-fg">
                      {t("rem_mode")}
                    </p>
                    {savingKey === "rem_mode_enabled" && (
                      <Loader2 className="animate-spin h-3.5 w-3.5 text-indigo-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {systemConfig.rem_mode_enabled === "true"
                      ? t("rem_mode_desc_enabled")
                      : t("rem_mode_desc_disabled")}
                  </p>
                </div>
                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() =>
                      handleUpdateConfig(
                        "rem_mode_enabled",
                        systemConfig.rem_mode_enabled === "true"
                          ? "false"
                          : "true",
                      )
                    }
                    disabled={savingKey !== null}
                    className={`relative inline-flex items-center h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-500 focus:outline-none ${
                      systemConfig.rem_mode_enabled === "true"
                        ? "bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                        : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 ring-offset-0 transition-transform duration-500 ${
                        systemConfig.rem_mode_enabled === "true"
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    >
                      {systemConfig.rem_mode_enabled === "true" ? (
                        <Moon
                          size={12}
                          className="text-violet-600 animate-pulse"
                        />
                      ) : (
                        <Sun size={12} className="text-slate-500" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Forget Mode Switch */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-foreground/5 border border-white/5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-dashboard-fg">
                      {t("forget_mode")}
                    </p>
                    {savingKey === "forget_mode_enabled" && (
                      <Loader2 className="animate-spin h-3.5 w-3.5 text-indigo-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {(systemConfig.forget_mode_enabled || "false") === "true"
                      ? t("forget_mode_desc_enabled")
                      : t("forget_mode_desc_disabled")}
                  </p>
                </div>
                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() =>
                      handleUpdateConfig(
                        "forget_mode_enabled",
                        (systemConfig.forget_mode_enabled || "false") === "true"
                          ? "false"
                          : "true",
                      )
                    }
                    disabled={savingKey !== null}
                    className={`relative inline-flex items-center h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-500 focus:outline-none ${
                      (systemConfig.forget_mode_enabled || "false") === "true"
                        ? "bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]"
                        : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 ring-offset-0 transition-transform duration-500 ${
                        (systemConfig.forget_mode_enabled || "false") === "true"
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    >
                      {(systemConfig.forget_mode_enabled || "false") ===
                      "true" ? (
                        <Brain
                          size={12}
                          className="text-indigo-600 animate-pulse"
                        />
                      ) : (
                        <Sun size={12} className="text-slate-500" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Forget Dry Run Switch */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-foreground/5 border border-white/5">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-dashboard-fg">
                      {t("forget_dry_run")}
                    </p>
                    {savingKey === "forget_dry_run_enabled" && (
                      <Loader2 className="animate-spin h-3.5 w-3.5 text-indigo-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {(systemConfig.forget_dry_run_enabled || "true") === "true"
                      ? t("forget_dry_run_desc_enabled")
                      : t("forget_dry_run_desc_disabled")}
                  </p>
                </div>
                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() =>
                      handleUpdateConfig(
                        "forget_dry_run_enabled",
                        (systemConfig.forget_dry_run_enabled || "true") ===
                          "true"
                          ? "false"
                          : "true",
                      )
                    }
                    disabled={savingKey !== null}
                    className={`relative inline-flex items-center h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-500 focus:outline-none ${
                      (systemConfig.forget_dry_run_enabled || "true") === "true"
                        ? "bg-amber-600 shadow-[0_0_12px_rgba(217,119,6,0.5)]"
                        : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 ring-offset-0 transition-transform duration-500 ${
                        (systemConfig.forget_dry_run_enabled || "true") ===
                        "true"
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    >
                      {(systemConfig.forget_dry_run_enabled || "true") ===
                      "true" ? (
                        <Sliders
                          size={12}
                          className="text-amber-600 animate-pulse"
                        />
                      ) : (
                        <Sun size={12} className="text-slate-500" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Similarity Slider */}
              <div className="space-y-2 p-4 rounded-xl bg-foreground/5 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                      {t("similarity_threshold")}
                    </p>
                    {savingKey === "rem_similarity_threshold" && (
                      <Loader2 className="animate-spin h-3 w-3 text-indigo-500" />
                    )}
                  </div>
                  <span className="text-xs font-black text-indigo-400">
                    {Math.round(similarityVal * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="1.00"
                  step="0.01"
                  disabled={savingKey !== null}
                  value={similarityVal}
                  onChange={(e) => setSimilarityVal(parseFloat(e.target.value))}
                  onMouseUp={() =>
                    handleUpdateConfig(
                      "rem_similarity_threshold",
                      similarityVal.toString(),
                    )
                  }
                  onTouchEnd={() =>
                    handleUpdateConfig(
                      "rem_similarity_threshold",
                      similarityVal.toString(),
                    )
                  }
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 leading-normal">
                  {t("similarity_threshold_desc")}
                </p>
              </div>

              {/* Confidence Slider */}
              <div className="space-y-2 p-4 rounded-xl bg-foreground/5 border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                      {t("confidence_threshold")}
                    </p>
                    {savingKey === "rem_confidence_threshold" && (
                      <Loader2 className="animate-spin h-3 w-3 text-indigo-500" />
                    )}
                  </div>
                  <span className="text-xs font-black text-indigo-400">
                    {Math.round(confidenceVal * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="1.00"
                  step="0.01"
                  disabled={savingKey !== null}
                  value={confidenceVal}
                  onChange={(e) => setConfidenceVal(parseFloat(e.target.value))}
                  onMouseUp={() =>
                    handleUpdateConfig(
                      "rem_confidence_threshold",
                      confidenceVal.toString(),
                    )
                  }
                  onTouchEnd={() =>
                    handleUpdateConfig(
                      "rem_confidence_threshold",
                      confidenceVal.toString(),
                    )
                  }
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 leading-normal">
                  {t("confidence_threshold_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Brain Connectivity */}
          <div className="rounded-2xl glass p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400">
                <Database size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight text-dashboard-fg uppercase">
                  {t("brain_connectivity")}
                </h4>
                <p className="text-xs text-slate-500">{t("db_sync_status")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {t("db_engine")}
                </p>
                <p className="text-sm font-bold text-dashboard-fg">
                  PostgreSQL + pgvector
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {t("sync_strategy")}
                </p>
                <p className="text-sm font-bold text-dashboard-fg">
                  {t("atomic_commits")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tag Appearance Management */}
        <div className="space-y-6">
          <div className="rounded-2xl glass p-8 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
                <Palette size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight text-dashboard-fg uppercase">
                  {t("tag_appearance")}
                </h4>
                <p className="text-xs text-slate-500">
                  {t("manage_tag_colors_desc")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tag List */}
              <div className="grid grid-cols-1 gap-3 max-h-[calc(100vh-25rem)] min-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-foreground/5 border border-foreground/5 hover:border-accent-primary/50 hover:bg-foreground/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 border border-white/5">
                        <TagIcon size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dashboard-fg">
                          {tag.name}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                          {tag.scope} {tag.version ? `• ${tag.version}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="relative group/color flex items-center">
                      <div
                        className="h-6 w-6 rounded-full border border-white/20 shadow-xl transition-all duration-300 group-hover/color:scale-125 cursor-pointer ring-offset-2 ring-offset-slate-900 group-hover/color:ring-2 ring-indigo-500/50"
                        style={{ backgroundColor: tag.color || "#818cf8" }}
                        onClick={(e) => {
                          const input = e.currentTarget
                            .nextSibling as HTMLInputElement;
                          input.click();
                        }}
                      />
                      <input
                        type="color"
                        value={tag.color || "#818cf8"}
                        onChange={(e) =>
                          handleUpdateColor(tag.id, e.target.value)
                        }
                        className="absolute opacity-0 w-0 h-0 pointer-events-none"
                      />
                    </div>

                    {isSaving === tag.id && (
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
