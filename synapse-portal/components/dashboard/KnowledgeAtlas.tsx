"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  RotateCcw,
  Brain,
} from "lucide-react";
import dynamic from "next/dynamic";

const KnowledgeGraph = dynamic(() => import("@/components/KnowledgeGraph"), {
  ssr: false,
});

import KnowledgeExplorer from "@/components/shared/KnowledgeExplorer";
import { Node, Edge, Tag } from "@/lib/db";
import { useI18n } from "@/lib/i18n";
import { groupTagsByScope, getConnectedTagIds } from "@/lib/graph-theme";

export default function KnowledgeAtlas({
  nodes,
  edges,
  tags = [],
}: {
  nodes: Node[];
  edges: Edge[];
  tags?: Tag[];
}) {
  const { t } = useI18n();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [hideOrphans, setHideOrphans] = useState(true);
  const [visibleTagIds, setVisibleTagIds] = useState<Set<string>>(
    new Set(tags.map((t) => t.id)),
  );

  const graphRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    zoomToFit: (d?: number) => void;
  } | null>(null);

  const tagsByScope = useMemo(() => groupTagsByScope(tags), [tags]);
  const connectedTagIds = useMemo(() => getConnectedTagIds(edges), [edges]);

  // Filter graph data
  const filteredNodes = useMemo(() => {
    // 1. First pass: Filter tags
    const step1 = nodes.filter((n) => {
      if (n.type === "TAG") {
        const isVisible = visibleTagIds.has(n.id);
        const isConnected = connectedTagIds.has(n.id);
        if (!isVisible) return false;
        if (hideOrphans && !isConnected) return false;
      }
      return true;
    });

    // 2. Second pass: Filter roots that no longer have visible children
    const visibleTagScopes = new Set(
      step1
        .filter((n) => n.type === "TAG")
        .map((n) => {
          try {
            return JSON.parse(n.properties || "{}").scope?.toLowerCase();
          } catch {
            return null;
          }
        }),
    );

    return step1.filter((n) => {
      if (n.type === "ROOT_SCOPE") {
        const scopeName = n.id.replace("root-", "").toLowerCase();
        return visibleTagScopes.has(scopeName);
      }
      return true;
    });
  }, [nodes, visibleTagIds, connectedTagIds, hideOrphans]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.from_id) && nodeIds.has(e.to_id));
  }, [edges, filteredNodes]);

  const handleZoomIn = () => graphRef.current?.zoomIn();
  const handleZoomOut = () => graphRef.current?.zoomOut();
  const handleResetZoom = () => graphRef.current?.zoomToFit(400);

  const handleOnRef = React.useCallback(
    (ref: {
      zoomIn: () => void;
      zoomOut: () => void;
      zoomToFit: (d?: number) => void;
    }) => {
      graphRef.current = ref;
    },
    [],
  );

  const handleToggleTag = (tagId: string) => {
    const next = new Set(visibleTagIds);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    setVisibleTagIds(next);
  };

  return (
    <section
      className={`transition-all duration-500 ${
        isFullscreen
          ? "fixed inset-0 z-[100] bg-[#020617]"
          : "relative space-y-4"
      }`}
    >
      {!isFullscreen && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-dashboard-fg">
              {t("knowledge_graph")}
            </h3>
            <p className="text-xs text-slate-600">{t("graph_description")}</p>
          </div>
        </div>
      )}

      <div
        className={`relative w-full overflow-hidden transition-all duration-500 ${
          isFullscreen
            ? "h-full w-full"
            : "h-[calc(100vh-14rem)] min-h-[500px] rounded-2xl glass shadow-2xl"
        }`}
      >
        <KnowledgeGraph
          nodes={filteredNodes}
          edges={filteredEdges}
          onRef={handleOnRef}
        />

        {/* Overlay Controls */}
        <div className="absolute right-6 top-6 z-[110] flex flex-col gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-xl glass p-3 text-slate-500 shadow-2xl backdrop-blur-xl transition-all hover:bg-foreground/5 hover:text-dashboard-fg"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={`rounded-xl glass p-3 shadow-2xl backdrop-blur-xl transition-all ${
              showExplorer
                ? "bg-accent-primary text-white"
                : "text-slate-500 hover:bg-foreground/5 hover:text-dashboard-fg"
            }`}
          >
            <Brain size={18} />
          </button>
          <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/60 p-1 backdrop-blur-xl">
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-500 transition-all hover:bg-foreground/5 hover:text-dashboard-fg"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-500 transition-all hover:bg-foreground/5 hover:text-dashboard-fg"
            >
              <Minus size={18} />
            </button>
            <button
              onClick={handleResetZoom}
              className="border-t border-foreground/5 p-2 text-slate-500 transition-all hover:bg-foreground/5 hover:text-dashboard-fg"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Explorer Overlay */}
        {showExplorer && (
          <div
            className={`absolute bottom-8 left-8 z-[110] transition-all duration-500 ${
              isFullscreen ? "opacity-100" : "opacity-90"
            }`}
          >
            <KnowledgeExplorer
              tagsByScope={tagsByScope}
              connectedTagIds={connectedTagIds}
              hideOrphans={hideOrphans}
              onToggleOrphans={setHideOrphans}
              visibleTags={visibleTagIds}
              onToggleTag={handleToggleTag}
            />
          </div>
        )}

        {isFullscreen && (
          <div className="absolute left-8 top-8 z-[110]">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Brain size={18} />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-dashboard-fg uppercase">
                  {t("knowledge_graph")}
                </p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase">
                  {t("fullscreen_analysis")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
