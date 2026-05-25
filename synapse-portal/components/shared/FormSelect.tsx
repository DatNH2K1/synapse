import React from "react";
import { ChevronDown } from "lucide-react";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function FormSelect({
  label,
  options,
  className,
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          {...props}
          className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold 
          focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none 
          transition-all appearance-none cursor-pointer group-hover:border-white/20 ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-amber-500 transition-colors">
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
}
