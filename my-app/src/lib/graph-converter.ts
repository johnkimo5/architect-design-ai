interface GraphNode {
  id: string
  type: string
  props: Record<string, unknown>
}

interface GraphEdge {
  from: string
  to: string
}

export interface LogicalGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface StoreRecord {
  id: string
  typeName: string
  type?: string
  props?: Record<string, unknown>
  fromId?: string
  toId?: string
}

interface Snapshot {
  store?: Record<string, StoreRecord>
}

/**
 * Converts a tldraw snapshot into a simplified logical graph for AI analysis.
 * Strips out visual properties (x, y, rotation, etc.) and keeps only semantic information.
 */
export function convertTldrawToGraph(snapshot: Snapshot): LogicalGraph {
  if (!snapshot?.store) {
    return { nodes: [], edges: [] }
  }

  const records = Object.values(snapshot.store)
  const shapes = records.filter((r) => r.typeName === 'shape')
  const bindings = records.filter((r) => r.typeName === 'binding')

  // Extract non-arrow shapes as nodes
  const nodes: GraphNode[] = shapes
    .filter((shape) => shape.type !== 'arrow')
    .map((shape) => ({
      id: shape.id,
      type: shape.type || 'unknown',
      props: extractSemanticProps(shape.props || {}),
    }))

  // Convert arrow bindings to edges
  // Each arrow has two bindings: one for 'start' terminal, one for 'end'
  const arrowBindings = new Map<string, { start?: string; end?: string }>()

  for (const binding of bindings) {
    const arrowId = binding.fromId
    const targetId = binding.toId
    const terminal = (binding.props as { terminal?: string })?.terminal

    if (!arrowId || !targetId) continue

    if (!arrowBindings.has(arrowId)) {
      arrowBindings.set(arrowId, {})
    }
    const arrow = arrowBindings.get(arrowId)!
    if (terminal === 'start') arrow.start = targetId
    if (terminal === 'end') arrow.end = targetId
  }

  const edges: GraphEdge[] = Array.from(arrowBindings.values())
    .filter((arrow) => arrow.start && arrow.end)
    .map((arrow) => ({
      from: arrow.start!,
      to: arrow.end!,
    }))

  return { nodes, edges }
}

/**
 * Extracts semantic properties, stripping visual-only properties.
 */
function extractSemanticProps(props: Record<string, unknown>): Record<string, unknown> {
  // Properties to exclude (visual-only)
  const visualProps = new Set([
    'w', 'h', 'color', 'fill', 'dash', 'size', 'font',
    'align', 'verticalAlign', 'growY', 'url', 'opacity'
  ])

  const semantic: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(props)) {
    if (!visualProps.has(key) && value !== undefined) {
      semantic[key] = value
    }
  }

  return semantic
}
