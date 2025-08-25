"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from "reactflow";
// Use bundled ELK to avoid web worker resolution issues in Next.js
// Types are imported from the main package
import ElkConstructor from "elkjs/lib/elk.bundled.js";
import type { ElkNode, ElkExtendedEdge } from "elkjs";
import { useGetCriticalPath } from "../../clientLib/Todos/useGetCriticalPath";
import "reactflow/dist/style.css";

// Instantiate ELK from the bundled build
const elk = new (ElkConstructor as unknown as {
  new (): { layout: (graph: ElkNode) => Promise<any> };
})();

export default function DependencyGraph() {
  const [isLayingOut, setIsLayingOut] = useState(false);
  const { data: criticalPathData, isLoading, error } = useGetCriticalPath();

  // Build base nodes/edges (ids and data only). Positions will be computed by ELK.
  const { baseNodes, baseEdges } = useMemo(() => {
    if (
      !criticalPathData ||
      !criticalPathData.allNodes ||
      criticalPathData.allNodes.length === 0
    ) {
      return { baseNodes: [], baseEdges: [] } as {
        baseNodes: Node[];
        baseEdges: Edge[];
      };
    }

    // Nodes without positions yet - color based on critical path
    const nodes: Node[] = criticalPathData.allNodes.map((todo) => ({
      id: todo.id.toString(),
      type: "default",
      data: {
        label: todo.title,
        estimatedDays: todo.estimatedCompletionDays,
        isCritical: todo.isCritical,
      },
      position: { x: 0, y: 0 },
      width: 260,
      height: 100,
      style: {
        backgroundColor: todo.isCritical ? "#ef4444" : "#f59e0b", // Red for critical, orange for non-critical
        color: "white",
        border: "2px solid",
        borderColor: todo.isCritical ? "#dc2626" : "#d97706",
        borderRadius: "8px",
        fontWeight: todo.isCritical ? "600" : "500",
      },
    }));

    // Edges with duplicates prevented and color based on critical path
    const edgeSet = new Set<string>();
    const edges: Edge[] = [];

    criticalPathData.allEdges.forEach((edge) => {
      const edgeId = `e${edge.parentTodo}-${edge.childTodo}`;
      if (edgeSet.has(edgeId)) return;

      const parentExists = criticalPathData.allNodes.some(
        (t) => t.id === edge.parentTodo
      );
      const childExists = criticalPathData.allNodes.some(
        (t) => t.id === edge.childTodo
      );
      if (!parentExists || !childExists) return;

      edges.push({
        id: edgeId,
        source: edge.parentTodo.toString(),
        target: edge.childTodo.toString(),
        type: "straight",
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge.isCritical ? "#ef4444" : "#f59e0b", // Red for critical, orange for non-critical
          width: 18,
          height: 18,
        },
        style: {
          stroke: edge.isCritical ? "#ef4444" : "#f59e0b", // Red for critical, orange for non-critical
          strokeWidth: edge.isCritical ? 3 : 2, // Thicker for critical edges
          strokeDasharray: edge.isCritical ? "none" : "6 3", // Solid for critical, dashed for non-critical
        },
      });
      edgeSet.add(edgeId);
    });

    return { baseNodes: nodes, baseEdges: edges };
  }, [criticalPathData]);

  // ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState(baseNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(baseEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Run ELK layout whenever base graph changes
  useEffect(() => {
    if (baseNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const elkGraph: ElkNode = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "DOWN",
        "elk.layered.spacing.nodeNodeBetweenLayers": "80",
        "elk.spacing.nodeNode": "60",
        "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
        "elk.padding": "40",
      },
      children: baseNodes.map((n) => ({
        id: n.id,
        width: n.width || 260,
        height: n.height || 100,
      })),
      edges: baseEdges.map((e) => ({
        id: e.id,
        sources: [e.source],
        targets: [e.target],
      })) as unknown as ElkExtendedEdge[],
    };

    let cancelled = false;
    setIsLayingOut(true);
    elk
      .layout(elkGraph)
      .then((g) => {
        if (cancelled) return;
        // Map positions back to React Flow nodes
        const positionedNodes = baseNodes.map((n) => {
          const child = g.children?.find((c: any) => c.id === n.id);
          return {
            ...n,
            position: {
              x: child?.x || 0,
              y: child?.y || 0,
            },
          } as Node;
        });
        setNodes(positionedNodes);
        setEdges(baseEdges);
      })
      .finally(() => {
        if (!cancelled) setIsLayingOut(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseNodes, baseEdges, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">
            Calculating Critical Path...
          </p>
          <p className="text-sm">Analyzing task dependencies and durations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">
            Error Loading Critical Path
          </p>
          <p className="text-sm">Failed to calculate critical path</p>
        </div>
      </div>
    );
  }

  if (
    !criticalPathData ||
    !criticalPathData.allNodes ||
    criticalPathData.allNodes.length === 0
  ) {
    return (
      <div className="w-full h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No tasks to visualize</p>
          <p className="text-sm">
            Create some tasks with dependencies to see the graph
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 relative">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 p-4 rounded-lg border text-sm shadow-sm">
        <div className="font-semibold mb-3 text-gray-800">
          Critical Path Legend
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
            <span className="text-gray-700">Critical Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded border-2 border-orange-600"></div>
            <span className="text-gray-700">Non-Critical</span>
          </div>
        </div>
        {criticalPathData.totalDuration > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">Total Duration</div>
            <div className="font-semibold text-gray-800">
              {criticalPathData.totalDuration} days
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 p-3 rounded-lg border text-xs">
        <div className="font-semibold mb-2">Debug Info:</div>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div>Critical: {criticalPathData.criticalPath.length}</div>
        {isLayingOut && <div className="text-slate-500">Laying out…</div>}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
