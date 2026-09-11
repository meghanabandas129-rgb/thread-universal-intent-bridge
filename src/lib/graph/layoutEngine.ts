import dagre from "dagre";
import { SituationModel } from "../types/situation";
import { Node, Edge } from "@xyflow/react";

export interface CustomNodeData {
  title: string;
  subtitle?: string;
  category?: string;
  urgency?: string;
  priority?: string;
  trustState?: string;
  whyReasoning?: string;
  systemName?: string;
  timeframe?: string;
  instruction?: string;
  isCompleted?: boolean;
  rawItem?: any;
  [key: string]: unknown;
}

export function buildGraphFromSituation(
  model: SituationModel,
  direction: "LR" | "TB" = "LR"
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 90,
    marginx: 40,
    marginy: 40,
  });

  const nodes: Node<CustomNodeData>[] = [];
  const edges: Edge[] = [];

  // 1. Situation Root Node
  const rootNodeId = `node-situation-${model.id}`;
  nodes.push({
    id: rootNodeId,
    type: "situationNode",
    position: { x: 0, y: 0 },
    data: {
      title: "Situation Overview",
      subtitle: model.metadata.summary,
      category: model.metadata.primaryDomain,
      urgency: model.metadata.overallSeverity,
      trustState: "USER_PROVIDED",
      rawItem: model,
    },
  });
  dagreGraph.setNode(rootNodeId, { width: 340, height: 160 });

  // 2. Need Nodes
  model.needs.forEach((need) => {
    const needNodeId = `node-need-${need.id}`;
    nodes.push({
      id: needNodeId,
      type: "needNode",
      position: { x: 0, y: 0 },
      data: {
        title: need.title,
        subtitle: need.description,
        category: need.category,
        urgency: need.urgency,
        trustState: need.trustState,
        whyReasoning: need.whyReasoning,
        rawItem: need,
      },
    });
    dagreGraph.setNode(needNodeId, { width: 300, height: 150 });

    // Connect Situation to Need
    edges.push({
      id: `edge-root-${need.id}`,
      source: rootNodeId,
      target: needNodeId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      data: { label: "Latent Need" },
    });
    dagreGraph.setEdge(rootNodeId, needNodeId);
  });

  // 3. System Nodes
  model.systems.forEach((sys) => {
    const sysNodeId = `node-sys-${sys.id}`;
    nodes.push({
      id: sysNodeId,
      type: "systemNode",
      position: { x: 0, y: 0 },
      data: {
        title: sys.name,
        subtitle: sys.purpose,
        category: sys.agencyType,
        systemName: sys.contactChannel,
        trustState: "VERIFIED",
        rawItem: sys,
      },
    });
    dagreGraph.setNode(sysNodeId, { width: 280, height: 130 });

    // Connect Needs that reference this system
    const mappedNeeds = model.needs.filter((n) => n.systemIds.includes(sys.id));
    mappedNeeds.forEach((n) => {
      const edgeId = `edge-need-sys-${n.id}-${sys.id}`;
      edges.push({
        id: edgeId,
        source: `node-need-${n.id}`,
        target: sysNodeId,
        type: "smoothstep",
        style: { stroke: "#38bdf8", strokeWidth: 1.5, strokeDasharray: "4 4" },
        data: { label: "Service Provider" },
      });
      dagreGraph.setEdge(`node-need-${n.id}`, sysNodeId);
    });
  });

  // 4. Action Nodes
  model.actions.forEach((act) => {
    const actNodeId = `node-act-${act.id}`;
    nodes.push({
      id: actNodeId,
      type: "actionNode",
      position: { x: 0, y: 0 },
      data: {
        title: act.title,
        subtitle: act.instruction,
        priority: act.priority,
        trustState: act.trustState,
        timeframe: act.timeframe,
        isCompleted: act.status === "completed",
        rawItem: act,
      },
    });
    dagreGraph.setNode(actNodeId, { width: 300, height: 140 });

    // Connect parent Need to Action
    const parentNeedId = `node-need-${act.needId}`;
    if (nodes.some((n) => n.id === parentNeedId)) {
      edges.push({
        id: `edge-need-act-${act.needId}-${act.id}`,
        source: parentNeedId,
        target: actNodeId,
        type: "smoothstep",
        animated: act.priority === "P0_critical",
        style: {
          stroke: act.priority === "P0_critical" ? "#ef4444" : "#f59e0b",
          strokeWidth: 2,
        },
        data: { label: act.priority.replace("_", " ").toUpperCase() },
      });
      dagreGraph.setEdge(parentNeedId, actNodeId);
    }
  });

  // 5. Inter-Action and Inter-Need Dependencies
  model.relationships.forEach((rel) => {
    const sourceNodeId = nodes.find((n) => n.id.includes(rel.sourceId))?.id;
    const targetNodeId = nodes.find((n) => n.id.includes(rel.targetId))?.id;

    if (sourceNodeId && targetNodeId) {
      edges.push({
        id: `edge-rel-${rel.id}`,
        source: sourceNodeId,
        target: targetNodeId,
        type: "smoothstep",
        animated: rel.relationType === "depends_on",
        style: {
          stroke: rel.relationType === "depends_on" ? "#ec4899" : "#a855f7",
          strokeWidth: 2,
          strokeDasharray: "5 5",
        },
        data: { label: rel.label },
      });
      dagreGraph.setEdge(sourceNodeId, targetNodeId);
    }
  });

  // Calculate Dagre layout
  dagre.layout(dagreGraph);

  // Apply computed positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPos.x - nodeWithPos.width / 2,
        y: nodeWithPos.y - nodeWithPos.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
