'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { convertTldrawToGraph } from '@/lib/graph-converter'
import { checkRateLimit } from '@/lib/ratelimit'

// Auth helper
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }
  return user
}

// ============================================
// Board CRUD Operations
// ============================================

export async function createBoard(title: string = 'Untitled Board') {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({ user_id: user.id, title })
    .select()
    .single()

  if (boardError) {
    console.error('Failed to create board:', boardError)
    throw new Error('Failed to create board')
  }

  // Create empty snapshot
  const { error: snapshotError } = await supabase
    .from('board_snapshots')
    .insert({ board_id: board.id, data: {} })

  if (snapshotError) {
    console.error('Failed to create snapshot:', snapshotError)
    // Clean up the board if snapshot creation failed
    await supabase.from('boards').delete().eq('id', board.id)
    throw new Error('Failed to create board')
  }

  revalidatePath('/')
  return board
}

export async function getBoards() {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('boards')
    .select('id, title, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch boards:', error)
    throw new Error('Failed to fetch boards')
  }

  return data
}

export async function getBoard(boardId: string) {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('boards')
    .select(`
      id, title, updated_at,
      board_snapshots (data)
    `)
    .eq('id', boardId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    console.error('Failed to fetch board:', error)
    throw new Error('Board not found')
  }

  return {
    id: data.id,
    title: data.title,
    updated_at: data.updated_at,
    snapshot: data.board_snapshots?.[0]?.data || {},
  }
}

export async function saveBoard(boardId: string, snapshot: unknown) {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  // Verify ownership
  const { data: board } = await supabase
    .from('boards')
    .select('id')
    .eq('id', boardId)
    .eq('user_id', user.id)
    .single()

  if (!board) {
    throw new Error('Board not found or access denied')
  }

  // Update snapshot
  const { error: snapshotError } = await supabase
    .from('board_snapshots')
    .update({ data: snapshot })
    .eq('board_id', boardId)

  if (snapshotError) {
    console.error('Failed to save board:', snapshotError)
    throw new Error('Failed to save board')
  }

  // Update board timestamp
  await supabase
    .from('boards')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', boardId)

  revalidatePath(`/board/${boardId}`)
  return { success: true }
}

export async function updateBoardTitle(boardId: string, title: string) {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('boards')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', boardId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to update title:', error)
    throw new Error('Failed to update title')
  }

  revalidatePath('/')
  revalidatePath(`/board/${boardId}`)
  return { success: true }
}

export async function deleteBoard(boardId: string) {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete board:', error)
    throw new Error('Failed to delete board')
  }

  revalidatePath('/')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ============================================
// AI Grading
// ============================================

const GradeResponseSchema = z.object({
  score: z.number().min(1).max(10),
  feedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingComponents: z.array(z.string()),
  securityRisks: z.array(z.string()),
})

export type GradeResponse = z.infer<typeof GradeResponseSchema>

export type GradeResult =
  | { success: true; result: GradeResponse; remaining: number }
  | { success: false; error: string; resetAt?: number }

export async function gradeDiagram(
  boardSnapshot: unknown,
  problemStatement: string
): Promise<GradeResult> {
  const user = await getAuthenticatedUser()

  // Rate limiting
  const rateLimit = await checkRateLimit(user.id)
  if (!rateLimit.success) {
    return {
      success: false,
      error: `Rate limit exceeded. You've used all 5 grades this hour.`,
      resetAt: rateLimit.reset,
    }
  }

  try {
    const logicalGraph = convertTldrawToGraph(boardSnapshot as Record<string, unknown>)

    // Check if there's anything to grade
    if (logicalGraph.nodes.length === 0) {
      return {
        success: false,
        error: 'No components found on the board. Add some system design shapes first.',
      }
    }

    const { object } = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: GradeResponseSchema,
      prompt: `You are a Senior Staff Engineer conducting a system design interview.

The candidate is trying to solve this problem: "${problemStatement}"

Analyze their design based on:
1. Scalability - Are there single points of failure? Can the system handle increased load?
2. Data Consistency - Is the data flow logical? Are there potential consistency issues?
3. Component Choice - Are the right components used for the problem?
4. Security - Are there obvious security risks or vulnerabilities?
5. Completeness - What essential components are missing?

Here is their current design represented as a graph:
${JSON.stringify(logicalGraph, null, 2)}

Component types found: ${[...new Set(logicalGraph.nodes.map(n => n.type))].join(', ')}
Total components: ${logicalGraph.nodes.length}
Total connections: ${logicalGraph.edges.length}

Provide:
- A score from 1-10 (be fair but rigorous)
- Detailed feedback explaining the score
- A list of strengths (what they did well)
- A list of weaknesses (what could be improved)
- Missing components they should consider adding
- Any security risks you identified`,
    })

    return {
      success: true,
      result: object,
      remaining: rateLimit.remaining,
    }
  } catch (error) {
    console.error('Grading failed:', error)
    return {
      success: false,
      error: 'Grading failed. Please try again.',
    }
  }
}
