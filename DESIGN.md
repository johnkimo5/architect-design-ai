Following the Hello Interview framework, we will break this down systematically. This framework prioritizes clarity and scoping before jumping into the implementation details.
1. Requirements
We start by defining the scope. For a "Proof of Concept" (PoC) that aims to scale into a usable product, we prioritize core drawing and AI features over complex real-time collaboration (for now).
Functional Requirements (FRs)
These are the features the user interacts with directly.
FR1: Canvas Management: Users can create, update, and delete whiteboard sessions.
FR2: Custom Component Library: Users can drag and drop specific system design nodes (Database, Load Balancer, Mobile Client) onto the canvas.
FR3: Users can click "Grade" Button and get feedback on their design.
FR4: Persistence: The board state must be saved automatically or manually so the user can resume work later.
FR5: Export: Users can export their design as an image (PNG/SVG) for use in documents.

Non-Functional Requirements (NFRs)
These are the system qualities that ensure a good user experience.
NFR1: Low Latency (Rendering): The canvas must run at 60fps. Interaction (dragging/zooming) must feel instantaneous.
NFR2: Accuracy (AI): The AI-generated diagrams must use valid JSON structure (no "floating" edges or broken schema).
NFR3: Reliability: User data (board state) should not be lost unexpectedly. We use manual save with a dirty flag and `beforeunload` warnings to prevent accidental data loss.
NFR4: Scalability (Storage): The system must handle large diagrams (1000+ nodes) without the database saving operation timing out.

2. Core Entities & Data Model
In System Design interviews, choosing the right database strategy is critical.
Decision: We will use PostgreSQL (via Supabase) for structured metadata, but we will use a JSONB column for the actual whiteboard content.
Why? Whiteboards are unstructured. Normalizing every single rectangle into a SQL row (e.g., Table: Shapes) is a performance nightmare. Storing the whole board as one JSON blob is standard industry practice (Figma and Excalidraw do variations of this).
ER Diagram (Entity Relationship)
Schema Definition
1. Users Table (Managed by Auth Provider)
id: UUID (Primary Key)
email: VARCHAR
created_at: TIMESTAMP
2. Boards Table
This is the metadata layer.
id: UUID (PK)
user_id: UUID (FK -> Users.id) — Who owns this?
title: VARCHAR — e.g., "Uber System Design"
is_public: BOOLEAN — For sharing links later.
created_at: TIMESTAMP
updated_at: TIMESTAMP
3. Board_Snapshots Table (Or simplified into Boards)
This holds the heavy data.
board_id: UUID (FK -> Boards.id)
data: JSONB — Contains the massive tldraw object.
version: INT — For simple version history.
The JSONB Structure (The "Data" Column)
This is what the frontend (tldraw) actually reads and writes.
JSON
{
  "shapes": {
    "shape_1": { "id": "shape_1", "type": "database", "x": 100, "y": 200, "props": { "dbType": "postgres" } },
    "shape_2": { "id": "shape_2", "type": "server", "x": 300, "y": 200 }
  },
  "bindings": { ... } // Connectors/Arrows
}



3. API Design
Since we are using Next.js, our "API" is actually a set of Server Actions. However, for the sake of the System Design framework, we define them as logical RPC (Remote Procedure Call) endpoints.
A. Board Management
createBoard(title: string) -> BoardID
Creates a new row in Boards and an initial empty JSON in data.
getBoard(boardId: UUID) -> { metadata, data }
Fetches the JSON blob to "hydrate" the canvas on load.
saveBoard(boardId: UUID, snapshot: JSON) -> Success/Fail
Updates the data column.
Optimization: In a real interview, you might discuss "Differential Sync" (only sending changes), but for a PoC, sending the whole snapshot is acceptable.
// app/actions.ts type GradeResponse = { score: number; // 1-10 feedback: string; // "Good job, but you missed a cache." missingComponents: string[]; // ["Redis", "CDN"] securityRisks: string[]; // ["Database is publicly accessible"] } export async function gradeDiagram(boardSnapshot: any, problemStatement: string) { // 1. Minify the snapshot (remove useless x,y coords, keep connections) const logicalGraph = convertTldrawToGraph(boardSnapshot); // 2. Call AI const { object } = await generateObject({ model: google('gemini-1.5-pro'), // Large context window is great for this schema: z.object({ ... }), // Define the shape of GradeResponse prompt: ` You are a Senior Staff Engineer conducting a system design interview. The user is trying to solve this problem: "${problemStatement}". Analyze their design based on: 1. Scalability (Single points of failure?) 2. Data Consistency 3. Component Choice Here is their current design graph: ${JSON.stringify(logicalGraph)} ` }); return object; }
A. The New Workflow
User Actions: The user manually drags a "Load Balancer" and "Server" onto the canvas and connects them.
Trigger: User clicks a "Grade My Design" button.
Data Capture: You capture the current state of the board.
Option A (Text): Extract the JSON list of shapes and connections.
Option B (Vision): Take a hidden screenshot (base64 image) of the canvas.
AI Analysis: Send the data to the LLM with a rubric prompt.
Feedback: The AI returns a structured review (e.g., "Strengths," "Weaknesses," "Missing Components") which you display in a Markdown side panel.

4. Save Strategy
Decision: Manual Save with Dirty Flag Warning
For the PoC, we use manual save (Cmd+S or Save button) rather than autosave. This reduces API calls and gives users explicit control.

Implementation:
- Track a "dirty" flag that becomes true when the board state changes
- Save on user action (button click or Cmd+S keyboard shortcut)
- Use `beforeunload` event to warn users if they try to leave with unsaved changes
- Clear the dirty flag after successful save

Why not autosave?
- Fewer API calls = lower cost and reduced database load
- Users have explicit control over when their work is persisted
- Simpler implementation for PoC
- Can upgrade to debounced autosave later if user feedback demands it

5. Security
We implement defense-in-depth with multiple security layers.

A. Authentication
- All routes require authentication via Supabase Auth
- No anonymous access to boards (even public ones require login for PoC)
- Server actions validate user session before any database operation

B. Row-Level Security (RLS) Policies
Database-level enforcement ensures security even if application code has bugs.

```sql
-- Enable RLS on tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can only access their own boards
CREATE POLICY "Users can view own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- Snapshots inherit access from parent board
CREATE POLICY "Users can access own board snapshots"
  ON board_snapshots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_snapshots.board_id
      AND boards.user_id = auth.uid()
    )
  );
```

C. Server Action Validation
Even with RLS, we validate ownership explicitly in server actions for clarity and error handling.

```typescript
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }
  return user;
}

export async function saveBoard(boardId: string, snapshot: any) {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  // Explicit ownership check (RLS also enforces this)
  const { data: board } = await supabase
    .from('boards')
    .select('id')
    .eq('id', boardId)
    .eq('user_id', user.id)
    .single();

  if (!board) {
    throw new Error('Board not found or access denied');
  }

  // Proceed with save...
}
```

6. Rate Limiting
The AI grading feature is expensive (API costs) and must be protected from abuse.

Decision: Use Upstash Redis for serverless-compatible rate limiting.

Configuration:
- 5 grade requests per user per hour (sliding window)
- Returns remaining quota and reset time on limit exceeded

Implementation:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const gradeRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
});

export async function gradeDiagram(boardSnapshot: any, problemStatement: string) {
  const user = await getAuthenticatedUser();

  const { success, remaining, reset } = await gradeRatelimit.limit(user.id);
  if (!success) {
    throw new Error(`Rate limit exceeded. Resets at ${new Date(reset).toLocaleTimeString()}`);
  }

  // Proceed with AI grading...
}
```

Why Upstash?
- Works with serverless (Vercel, Cloudflare Workers)
- No connection pooling issues like traditional Redis
- Built-in analytics for monitoring usage patterns

7. Graph Conversion for AI Grading
The `convertTldrawToGraph` function transforms raw tldraw snapshots into a simplified graph structure for AI analysis.

A. The Problem
Raw tldraw snapshots contain visual properties (x, y, rotation, opacity, dimensions) that are irrelevant to system design evaluation. The AI only needs to understand:
- What components exist (nodes)
- How they're connected (edges)
- Semantic properties (e.g., database type)

B. Input: Raw tldraw Snapshot
```json
{
  "shapes": {
    "shape:abc123": {
      "id": "shape:abc123",
      "type": "database",
      "x": 150, "y": 320,
      "rotation": 0, "opacity": 1,
      "props": { "dbType": "postgres", "w": 100, "h": 80 }
    },
    "shape:arrow1": {
      "id": "shape:arrow1",
      "type": "arrow",
      "x": 250, "y": 360
    }
  },
  "bindings": {
    "binding:xyz": {
      "fromId": "shape:arrow1",
      "toId": "shape:abc123",
      "props": { "terminal": "start" }
    }
  }
}
```

C. Output: Simplified Graph
```json
{
  "nodes": [
    { "id": "shape:abc123", "type": "database", "props": { "dbType": "postgres" } },
    { "id": "shape:def456", "type": "server", "props": {} }
  ],
  "edges": [
    { "from": "shape:def456", "to": "shape:abc123" }
  ]
}
```

D. Implementation
```typescript
interface GraphNode {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface LogicalGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function convertTldrawToGraph(snapshot: TLStoreSnapshot): LogicalGraph {
  const records = Object.values(snapshot.store);
  const shapes = records.filter(r => r.typeName === 'shape');
  const bindings = records.filter(r => r.typeName === 'binding');

  // Extract non-arrow shapes as nodes
  const nodes = shapes
    .filter(shape => shape.type !== 'arrow')
    .map(shape => ({
      id: shape.id,
      type: shape.type,
      props: extractSemanticProps(shape.props)
    }));

  // Convert arrow bindings to edges
  // Each arrow has two bindings: one for 'start' terminal, one for 'end'
  const arrowBindings = new Map<string, { start?: string; end?: string }>();

  for (const binding of bindings) {
    const arrowId = binding.fromId;
    const targetId = binding.toId;
    const terminal = binding.props.terminal;

    if (!arrowBindings.has(arrowId)) {
      arrowBindings.set(arrowId, {});
    }
    arrowBindings.get(arrowId)![terminal] = targetId;
  }

  const edges = Array.from(arrowBindings.values())
    .filter(arrow => arrow.start && arrow.end)
    .map(arrow => ({
      from: arrow.start!,
      to: arrow.end!
    }));

  return { nodes, edges };
}

function extractSemanticProps(props: Record<string, any>): Record<string, any> {
  // Strip visual properties, keep semantic ones
  const { w, h, color, fill, dash, size, font, align, verticalAlign, ...semantic } = props;
  return semantic;
}
```

8. Problem Statement Input
The `problemStatement` parameter for AI grading comes from a user input field on the board page.

Implementation:
- Text input field in the grading panel sidebar
- Examples: "Design a URL shortener", "Design Twitter's feed"
- Stored per-board in the UI state (not persisted to database)
- Passed to `gradeDiagram()` when user clicks "Grade"

9. Export API
FR5 requires exporting designs as PNG/SVG. We use tldraw's built-in `exportAs` function.

A. Client-Side Export (Browser Download)
```typescript
import { exportAs } from 'tldraw';

async function exportDesign(editor: Editor, format: 'png' | 'svg') {
  const shapeIds = editor.getCurrentPageShapeIds();
  await exportAs(editor, [...shapeIds], {
    format,
    name: 'system-design'
  });
  // Triggers browser download
}
```

B. API Signature
```typescript
exportAs(
  editor: Editor,
  ids: TLShapeId[],
  opts: { format: 'png' | 'svg' | 'jpeg' | 'webp' | 'json', name?: string }
): Promise<void>
```

Note: This is client-side only. For server-side rendering (e.g., generating thumbnails), consider @kitschpatrol/tldraw-cli or headless browser approaches.

10. Error Handling
Simple error handling strategy for PoC.

A. Save Failures
- Display toast notification: "Failed to save. Please try again."
- Keep dirty flag as true so user knows changes aren't saved
- Log error to console for debugging

B. Rate Limit Exceeded
- Display inline message in grading panel: "You've used all 5 grades this hour. Resets at [time]."
- Disable the "Grade" button until reset
- Show remaining count proactively: "3/5 grades remaining"

C. AI Grading Failures
- Display: "Grading failed. Please try again."
- Don't count against rate limit (only successful calls count)
- Log error for debugging

Implementation Pattern:
```typescript
try {
  const result = await gradeDiagram(snapshot, problemStatement);
  setGradeResult(result);
} catch (error) {
  if (error.message.includes('Rate limit')) {
    setError({ type: 'rate_limit', message: error.message });
  } else {
    setError({ type: 'general', message: 'Grading failed. Please try again.' });
  }
}
```


