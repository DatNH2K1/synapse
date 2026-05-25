"use client";

import React from "react";
import { Check, Trash2, GitMerge, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PendingUpdate, NodeWithTags } from "./types";

interface ComparisonModalProps {
  comparingUpdate: {
    update: PendingUpdate;
    match?: NodeWithTags;
  };
  processingId: string | null;
  isSynthesizing: boolean;
  onClose: () => void;
  onAction: (id: string, action: "APPROVE" | "REJECT") => void;
  onStartMerge: (proposal: PendingUpdate, masters: NodeWithTags[]) => void;
}

export default function ComparisonModal({
  comparingUpdate,
  processingId,
  isSynthesizing,
  onClose,
  onAction,
  onStartMerge,
}: ComparisonModalProps) {
  const { t } = useI18n();
  const update = comparingUpdate.update;
  const match = comparingUpdate.match;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h4 className="text-xl font-black tracking-tight text-white uppercase italic">
              {t("diff_view")}
            </h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              ID: {update.id} • {update.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            {t("close")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6 custom-scrollbar">
          {/* Left Side: Current (Master) */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              {t("current_data")} (Master)
            </h5>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 h-full min-h-[300px]">
              {match ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Label
                    </p>
                    <p className="text-lg font-bold text-white">
                      {match.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Content
                    </p>
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono mt-2 bg-black/30 p-4 rounded-xl border border-white/5">
                      {JSON.parse(match.properties || "{}").content ||
                        "No content."}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <Trash2 size={32} className="mb-2 opacity-20" />
                  <p className="text-xs uppercase font-bold tracking-widest">
                    New Entry
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Proposed */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              {t("proposed_data")}
            </h5>
            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-6 h-full min-h-[300px] shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Label
                  </p>
                  <p className="text-lg font-bold text-white">{update.label}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Content
                  </p>
                  <pre className="text-xs text-emerald-100/60 whitespace-pre-wrap font-mono mt-2 bg-black/30 p-4 rounded-xl border border-emerald-500/10">
                    {JSON.parse(update.properties || "{}").content ||
                      "No content."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={() => onAction(update.id, "REJECT")}
            disabled={!!processingId}
            className="px-6 py-2 rounded-xl bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            {t("reject")}
          </button>

          {match && (
            <button
              onClick={() => onStartMerge(update, [match])}
              disabled={isSynthesizing || !!processingId}
              className="px-6 py-2 rounded-xl bg-amber-600/10 text-amber-500 border border-amber-500/20 hover:bg-amber-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              {isSynthesizing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <GitMerge size={14} />
              )}
              {t("merge")}
            </button>
          )}

          <button
            onClick={() => onAction(update.id, "APPROVE")}
            disabled={!!processingId}
            className="px-8 py-2 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            {processingId === update.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {t("approve")}
          </button>
        </div>
      </div>
    </div>
  );
}
