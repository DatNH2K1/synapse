"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Loader2, Download, Brain } from "lucide-react";
import { Node as DBNode, Tag } from "@/lib/db";
import { useI18n } from "@/lib/i18n";

interface ExtendedNode extends Omit<DBNode, "properties"> {
  distance: number;
  properties: string | { description?: string } | null;
}

export default function RelevanceExplorer() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExtendedNode[]>([]);
  const [allNodes, setAllNodes] = useState<(DBNode & { tags: Tag[] })[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<
    (DBNode & { tags: Tag[] }) | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [thawingNodeIds, setThawingNodeIds] = useState<Set<string>>(new Set());

  const handleWakeUp = async (nodeId: string) => {
    setThawingNodeIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });

    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nodeId, action: "WAKEUP" }),
      });
      const data = await res.json();
      if (data.success) {
        // Play premium thaw transition for 1.2s
        await new Promise((resolve) => setTimeout(resolve, 1200));

        setResults((prev) =>
          prev.map((n) =>
            n.id === nodeId ? { ...n, memory_tier: "ACTIVE" } : n,
          ),
        );
        setAllNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId ? { ...n, memory_tier: "ACTIVE" } : n,
          ),
        );
      } else {
        alert(data.message || "Failed to wake up node");
      }
    } catch (err) {
      console.error("Failed to wake up node", err);
    } finally {
      setThawingNodeIds((prev) => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all nodes for search suggestions
  useEffect(() => {
    fetch("/api/nodes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllNodes(data);
        } else {
          console.error("Nodes API did not return an array", data);
          setAllNodes([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch nodes", err);
        setAllNodes([]);
      });
  }, []);

  const handleSearch = async (nodeId: string) => {
    const node = allNodes.find((n) => n.id === nodeId);
    if (!node) return;

    setLoading(true);
    try {
      const tags = node.tags.map((t) => `${t.scope}:${t.name}`);
      const res = await fetch("/api/context/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        console.error("Context Export API did not return an array", data);
        setResults([]);
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  const exportMarkdown = async () => {
    if (results.length === 0) return;

    try {
      const selectedNodeInResults =
        results.find((n) => n.distance === 0) || results[0];
      const node = allNodes.find((n) => n.id === selectedNodeInResults.id);
      const tags = node
        ? node.tags.map((t) => `${t.scope}:${t.name}`)
        : [`project:${results[0].label.toLowerCase().replace(/\s+/g, "-")}`];

      const res = await fetch("/api/context/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags,
          format: "markdown",
        }),
      });

      const md = await res.text();
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relevance-context-${selectedNodeInResults.label.toLowerCase().replace(/\s+/g, "-")}.md`;
      a.click();
    } catch (e) {
      console.error("Markdown export failed", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 p-6 rounded-3xl glass backdrop-blur-xl relative z-20">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
            {t("search_node")}
          </label>
          <div className="relative" ref={dropdownRef}>
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl pl-12 pr-10 text-sm text-left text-dashboard-fg focus:outline-none focus:border-accent-primary/50 transition-all flex items-center justify-between"
            >
              <span
                className={
                  selectedNode ? "text-dashboard-fg" : "text-slate-500"
                }
              >
                {selectedNode
                  ? `${selectedNode.label} (${selectedNode.type})`
                  : t("search_node")}
              </span>
              <Brain
                size={14}
                className={`text-slate-600 transition-all ${isOpen ? "text-indigo-400 rotate-12" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 w-full mt-2 p-2 bg-dashboard-bg/95 border border-foreground/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                {allNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      setIsOpen(false);
                      handleSearch(node.id);
                    }}
                    className="w-full px-4 py-3 rounded-xl text-left text-xs font-bold text-slate-500 hover:bg-accent-primary/20 hover:text-dashboard-fg transition-all flex items-center justify-between group"
                  >
                    <span>{node.label}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-600 group-hover:bg-indigo-600/40 group-hover:text-indigo-200 uppercase">
                      {node.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={exportMarkdown}
          disabled={results.length === 0}
          className="h-12 px-6 bg-accent-primary text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-accent-primary/80 transition-all disabled:opacity-20 disabled:grayscale"
        >
          <Download size={16} />
          {t("export_md")}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Searching neural paths...
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {results.map((node) => {
            const isCold = node.memory_tier === "COLD";
            const isCore = node.memory_tier === "CORE";
            const isThawing = thawingNodeIds.has(node.id);

            return (
              <div
                key={node.id}
                className={`group p-5 rounded-2xl glass transition-all duration-1000 relative overflow-hidden ${
                  isThawing
                    ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[0.98] bg-amber-500/5"
                    : isCold
                      ? "border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.05)] opacity-85 hover:opacity-100"
                      : isCore
                        ? "border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                        : "hover:border-accent-primary/30"
                }`}
              >
                {/* Thermal Thaw Melt Overlay Effect */}
                {isThawing && (
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent pointer-events-none animate-pulse" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        node.distance === 0
                          ? "bg-accent-primary text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {node.distance === 0
                        ? "ORIGIN"
                        : `DIST: ${node.distance}`}
                    </span>

                    {/* Dynamic Memory Tier Badge */}
                    {isCold && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5 shadow-[0_0_8px_rgba(56,189,248,0.1)]">
                        ❄️ COLD
                      </span>
                    )}
                    {isCore && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5 shadow-[0_0_8px_rgba(168,85,247,0.1)]">
                        🔮 CORE
                      </span>
                    )}
                    {node.memory_tier === "ACTIVE" && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5">
                        ✨ ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">
                    {node.type}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-dashboard-fg mb-2">
                  {node.label}
                </h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {node.properties
                    ? typeof node.properties === "string"
                      ? JSON.parse(node.properties).description
                      : (node.properties as { description?: string })
                          .description || "No description available."
                    : "No description available."}
                </p>

                {/* Manual Wake Up Trigger (Thermal Thaw Action) */}
                {isCold && (
                  <button
                    onClick={() => handleWakeUp(node.id)}
                    disabled={isThawing}
                    className="w-full py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.05)] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                  >
                    {isThawing ? (
                      <>
                        <Loader2
                          className="animate-spin animate-duration-1000"
                          size={10}
                        />
                        Thawing...
                      </>
                    ) : (
                      <>🔥 Warm Up / Wake Up</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl glass bg-foreground/5">
          <Brain size={48} className="text-slate-800 mb-4 opacity-20" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Select a node to explore its neural neighborhood
          </p>
        </div>
      )}
    </div>
  );
}
