"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SituationModel } from "@/lib/types/situation";
import {
  buildGraphFromSituation,
  CustomNodeData,
} from "@/lib/graph/layoutEngine";

import { SituationNode } from "./nodes/SituationNode";
import { NeedNode } from "./nodes/NeedNode";
import { SystemNode } from "./nodes/SystemNode";
import { ActionNode } from "./nodes/ActionNode";

import {
  ArrowDownRight,
  ArrowRight,
  Eye,
  Filter,
} from "lucide-react";

const nodeTypes = {
  situationNode: SituationNode,
  needNode: NeedNode,
  systemNode: SystemNode,
  actionNode: ActionNode,
};

interface SituationGraphProps {
  model: SituationModel;
  onSelectNode: (node: Node<CustomNodeData> | null) => void;
  selectedNodeId?: string | null;
}

export function SituationGraph({
  model,
  onSelectNode,
  selectedNodeId,
}: SituationGraphProps) {
  const [direction, setDirection] = useState<"LR" | "TB">("LR");

  const [activeFilter, setActiveFilter] = useState<
    "all" | "p0" | "needs" | "systems"
  >("all");

  /*
   * Build the complete graph whenever:
   * - the situation model changes
   * - the layout direction changes
   */
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = buildGraphFromSituation(model, direction);

    return {
      initialNodes: nodes,
      initialEdges: edges,
    };
  }, [model, direction]);

  /*
   * React Flow local state.
   *
   * We keep the complete graph here and derive the visible
   * graph below from the selected filter.
   */
  const [nodes, setNodes, onNodesChange] =
  useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  /*
   * Re-sync React Flow whenever the generated graph changes.
   */
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [
    initialNodes,
    initialEdges,
    setNodes,
    setEdges,
  ]);

  /*
   * Apply the selected graph filter.
   */
  const filteredNodes = useMemo(() => {
    if (activeFilter === "p0") {
      return nodes.filter(
        (node) =>
          node.type === "situationNode" ||
          node.type === "needNode" ||
          (node.type === "actionNode" &&
            node.data?.priority === "P0_critical")
      );
    }

    if (activeFilter === "needs") {
      return nodes.filter(
        (node) =>
          node.type === "situationNode" ||
          node.type === "needNode"
      );
    }

    if (activeFilter === "systems") {
      return nodes.filter(
        (node) =>
          node.type === "needNode" ||
          node.type === "systemNode"
      );
    }

    return nodes;
  }, [nodes, activeFilter]);

  /*
   * Only keep edges where BOTH connected nodes are visible.
   *
   * This prevents dangling edges when using:
   * - P0 Critical Path
   * - Needs Only
   * - Agency Connectors
   */
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(
      filteredNodes.map((node) => node.id)
    );

    return edges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) &&
        visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  /*
   * Keep the externally selected node visually selected
   * even when the parent changes selectedNodeId.
   */
  const displayNodes = useMemo(() => {
    return filteredNodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
    }));
  }, [filteredNodes, selectedNodeId]);

  /*
   * When switching filters, if the currently selected node
   * is no longer visible, clear the selection.
   */
  useEffect(() => {
    if (
      selectedNodeId &&
      !filteredNodes.some((node) => node.id === selectedNodeId)
    ) {
      onSelectNode(null);
    }
  }, [activeFilter, filteredNodes, selectedNodeId, onSelectNode]);

  /*
   * Determine a useful graph title based on the active filter.
   */
  const filterLabel = useMemo(() => {
    switch (activeFilter) {
      case "p0":
        return "Critical Path";

      case "needs":
        return "Needs";

      case "systems":
        return "Connected Systems";

      default:
        return "Full Situation";
    }
  }, [activeFilter]);

  return (
    <div className="relative w-full h-[640px] rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-2xl backdrop-blur-sm">

      {/* =========================================================
          TOP GRAPH TOOLBAR
      ========================================================= */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg backdrop-blur-md">

          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-300 border-r border-slate-800 mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Graph View</span>
          </div>

          {/* Full Graph */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Full Graph
          </button>

          {/* P0 Critical Path */}
          <button
            onClick={() => setActiveFilter("p0")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
              activeFilter === "p0"
                ? "bg-red-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            P0 Critical Path
          </button>

          {/* Needs Only */}
          <button
            onClick={() => setActiveFilter("needs")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
              activeFilter === "needs"
                ? "bg-slate-700 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Needs Only
          </button>

          {/* Agency Connectors */}
          <button
            onClick={() => setActiveFilter("systems")}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
              activeFilter === "systems"
                ? "bg-slate-700 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Agency Connectors
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Layout Direction */}
          <button
            onClick={() =>
              setDirection(direction === "LR" ? "TB" : "LR")
            }
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
            title="Toggle Layout Orientation"
          >
            {direction === "LR" ? (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Horizontal</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Vertical</span>
              </>
            )}
          </button>
        </div>

        {/* Current View Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-[11px] font-medium text-slate-400">
            VIEW
          </span>

          <span className="text-xs font-semibold text-slate-200">
            {filterLabel}
          </span>

          <span className="text-[10px] text-slate-500">
            {displayNodes.length} nodes
          </span>
        </div>
      </div>

      {/* =========================================================
          LEGEND
      ========================================================= */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md text-[11px] text-slate-400">

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Situation Root</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Latent Need</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span>Connected System</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Action Step</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 pl-2 border-l border-slate-800">
          <Eye className="w-3 h-3 text-indigo-400" />
          <span>Click any node to inspect evidence</span>
        </div>
      </div>

      {/* =========================================================
          GRAPH STATUS
      ========================================================= */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg backdrop-blur-md">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          Connected
        </span>

        <span className="text-xs font-semibold text-slate-300">
          {filteredEdges.length} relationships
        </span>
      </div>

      {/* =========================================================
          REACT FLOW
      ========================================================= */}
      <ReactFlow
        nodes={displayNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.25,
          maxZoom: 1.15,
        }}
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeClick={(_, node) => {
          onSelectNode(node as Node<CustomNodeData>);
        }}
        onPaneClick={() => {
          onSelectNode(null);
        }}
        className="bg-slate-950"
      >
        {/* Background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#334155"
        />

        {/* Controls */}
        <Controls
          showInteractive={false}
          className="!bg-slate-900 !border-slate-800 !shadow-xl !rounded-xl !overflow-hidden [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 hover:[&>button]:!bg-slate-800"
        />

        {/* Mini Map */}
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "situationNode") {
              return "#6366f1";
            }

            if (node.type === "needNode") {
              return "#f43f5e";
            }

            if (node.type === "systemNode") {
              return "#0284c7";
            }

            return "#f59e0b";
          }}
          maskColor="rgba(2, 6, 23, 0.75)"
          className="!bg-slate-900/90 !border-slate-800 !rounded-xl !overflow-hidden hidden md:block"
        />
      </ReactFlow>
    </div>
  );
}


