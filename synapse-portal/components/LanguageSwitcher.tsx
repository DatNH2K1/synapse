"use client";

import React, { useState, useRef, useEffect } from "react";
import { useI18n, type Language } from "@/lib/i18n";

import { Globe, ChevronUp, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "vi", label: "Tiếng Việt", short: "VI" },
  { code: "ja", label: "日本語", short: "JA" },
  { code: "zh", label: "中文", short: "ZH" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2 px-1 mb-2">
        <Globe size={10} className="text-slate-500" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
          Language
        </span>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-indigo-400 group-hover:text-indigo-300 transition-colors">
            {currentLang.short}
          </span>
          <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">
            {currentLang.label}
          </span>
        </div>
        <ChevronUp
          size={14}
          className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 p-1 bg-slate-900/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code as Language);

                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                locale === lang.code
                  ? "bg-indigo-600/20 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-black ${locale === lang.code ? "text-indigo-400" : "text-slate-500"}`}
                >
                  {lang.short}
                </span>
                <span className="text-[11px] font-bold">{lang.label}</span>
              </div>
              {locale === lang.code && (
                <Check size={12} className="text-indigo-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
