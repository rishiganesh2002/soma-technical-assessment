export type GraphEdge = {
  parentTodo: number;
  childTodo: number;
};

export function detectCycle(
  vertices: Array<{ id: number }>,
  edges: GraphEdge[]
): void {
  // Collect all node ids
  const nodeIds = new Set<number>(vertices.map((v) => v.id));

  // Build adjacency list and in/out degrees
  const adjacency = new Map<number, number[]>();
  const indegree = new Map<number, number>();

  Array.from(nodeIds).forEach((id) => {
    adjacency.set(id, []);
    indegree.set(id, 0);
  });

  edges.forEach(({ parentTodo, childTodo }) => {
    // Ensure endpoints exist in our maps (in case inputs are not perfectly aligned)
    if (!adjacency.has(parentTodo)) adjacency.set(parentTodo, []);
    if (!adjacency.has(childTodo)) adjacency.set(childTodo, []);
    if (!indegree.has(parentTodo)) indegree.set(parentTodo, 0);
    if (!indegree.has(childTodo)) indegree.set(childTodo, 0);

    adjacency.get(parentTodo)!.push(childTodo);
    indegree.set(childTodo, (indegree.get(childTodo) || 0) + 1);
  });

  const visited = new Set<number>();
  const inStack = new Set<number>();

  const dfs = (node: number) => {
    visited.add(node);
    inStack.add(node);

    const neighbors = adjacency.get(node) || [];
    for (let i = 0; i < neighbors.length; i++) {
      const next = neighbors[i];
      if (!visited.has(next)) {
        dfs(next);
      } else if (inStack.has(next)) {
        throw new Error("Dependency cycle detected");
      }
    }

    inStack.delete(node);
  };

  // Start from roots: nodes with no incoming edges but with outgoing edges
  const roots: number[] = [];
  Array.from(adjacency.entries()).forEach(([id, neighbors]) => {
    const inDeg = indegree.get(id) || 0;
    if (inDeg === 0 && neighbors.length > 0) {
      roots.push(id);
    }
  });

  roots.forEach((root) => {
    if (!visited.has(root)) {
      dfs(root);
    }
  });

  // Fallback: traverse any remaining nodes (covers detached components and pure cycles)
  Array.from(adjacency.keys()).forEach((id) => {
    if (!visited.has(id)) {
      dfs(id);
    }
  });
}
