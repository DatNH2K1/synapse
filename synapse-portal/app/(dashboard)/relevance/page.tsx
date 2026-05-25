import React from "react";
import RelevanceExplorer from "@/components/dashboard/RelevanceExplorer";

export default function RelevancePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-dashboard-fg uppercase italic">
          Relevance Explorer<span className="text-indigo-500">.</span>
        </h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
          JIT Context Generation via Relevance Radius Algorithm
        </p>
      </div>

      <RelevanceExplorer />
    </div>
  );
}
