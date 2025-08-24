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
import type { TodoWithRelations } from "../../schema/Todos";
import "reactflow/dist/style.css";

interface DependencyGraphProps {
  todos: TodoWithRelations[];
}

// Instantiate ELK from the bundled build
const elk = new (ElkConstructor as unknown as {
  new (): { layout: (graph: ElkNode) => Promise<any> };
})();

export default function DependencyGraph({ todos }: DependencyGraphProps) {
  const [isLayingOut, setIsLayingOut] = useState(false);

  // Build base nodes/edges (ids and data only). Positions will be computed by ELK.
  const { baseNodes, baseEdges } = useMemo(() => {
    if (!todos || todos.length === 0) {
      return { baseNodes: [], baseEdges: [] } as {
        baseNodes: Node[];
        baseEdges: Edge[];
      };
    }

    // Nodes without positions yet
    const nodes: Node[] = todos.map((todo) => ({
      id: todo.id.toString(),
      type: "default",
      data: { label: todo.title },
      position: { x: 0, y: 0 },
      width: 260,
      height: 100,
    }));

    // Edges with duplicates prevented
    const edgeSet = new Set<string>();
    const edges: Edge[] = [];

    todos.forEach((todo) => {
      (todo.dependencies || []).forEach((dependency) => {
        const edgeId = `e${dependency.parentTodo}-${dependency.childTodo}`;
        if (edgeSet.has(edgeId)) return;

        const parentExists = todos.some((t) => t.id === dependency.parentTodo);
        const childExists = todos.some((t) => t.id === dependency.childTodo);
        if (!parentExists || !childExists) return;

        edges.push({
          id: edgeId,
          source: dependency.parentTodo.toString(),
          target: dependency.childTodo.toString(),
          type: "straight",
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#f59e0b",
            width: 18,
            height: 18,
          },
          style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "6 3" },
        });
        edgeSet.add(edgeId);
      });
    });

    return { baseNodes: nodes, baseEdges: edges };
  }, [todos]);

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

  if (!todos || todos.length === 0) {
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
      {/* Debug info */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg border text-xs">
        <div className="font-semibold mb-2">Debug Info:</div>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
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
