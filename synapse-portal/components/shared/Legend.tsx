import React from "react";

export default function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-white/5 backdrop-blur-sm">
      <div
        className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
        style={{ backgroundColor: color }}
      />
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}
