import type { ConversationMessage, ConversationSummary, PersistedBattle } from '@/types'

/**
 * Convert a flat user/assistant message list into renderable battles.
 * Each user message pairs with the next assistant message carrying
 * `metadata.{problem,solution_1,solution_2,judge}`.
 */
export function messagesToBattles(messages: ConversationMessage[]): PersistedBattle[] {
  const battles: PersistedBattle[] = []
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]
    if (!m || m.role !== 'user') continue
    const next = messages[i + 1]
    const meta = next && next.role === 'assistant' ? next.metadata : undefined
    if (
      meta &&
      typeof meta.problem === 'string' &&
      typeof meta.solution_1 === 'string' &&
      typeof meta.solution_2 === 'string' &&
      meta.judge &&
      typeof meta.judge === 'object'
    ) {
      battles.push({
        key: `${m._id ?? `u-${i}`}-${next?._id ?? `a-${i}`}`,
        problem: meta.problem as string,
        solution_1: meta.solution_1 as string,
        solution_2: meta.solution_2 as string,
        judge: meta.judge as PersistedBattle['judge'],
        createdAt: next?.createdAt ?? m.createdAt,
      })
      i++ // consume the paired assistant message
    } else {
      // User message whose AI response failed / is pending — still show the prompt.
      battles.push({
        key: `${m._id ?? `pending-${i}`}`,
        problem: m.content,
        solution_1: '',
        solution_2: '',
        judge: {
          solution_1_score: 0,
          solution_2_score: 0,
          solution_1_reasoning: '',
          solution_2_reasoning: '',
        },
        createdAt: m.createdAt,
      })
    }
  }
  return battles
}

export type HistoryGroup = 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older'

export function groupConversations(convos: ConversationSummary[]): { group: HistoryGroup; items: ConversationSummary[] }[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000)

  const buckets: Record<HistoryGroup, ConversationSummary[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 days': [],
    Older: [],
  }
  for (const c of convos) {
    const d = new Date(c.updatedAt)
    if (Number.isNaN(d.getTime()) || d >= startOfToday) buckets.Today.push(c)
    else if (d >= startOfYesterday) buckets.Yesterday.push(c)
    else if (d >= weekAgo) buckets['Previous 7 days'].push(c)
    else buckets.Older.push(c)
  }
  return (Object.keys(buckets) as HistoryGroup[])
    .map((group) => ({ group, items: buckets[group] }))
    .filter((g) => g.items.length > 0)
}

/** Deterministic client-side title fallback (mirrors backend, no AI call). */
export function titleFromInput(input: string): string {
  const collapsed = input.replace(/\s+/g, ' ').trim()
  if (!collapsed) return 'New conversation'
  const stripped = collapsed.replace(/[?.!,;:]+$/g, '').trim()
  const words = stripped.split(' ').slice(0, 6).join(' ')
  const truncated = words.length > 45 ? `${words.slice(0, 45).trim()}…` : words
  const titled = truncated.charAt(0).toUpperCase() + truncated.slice(1)
  return titled.slice(0, 100) || 'New conversation'
}
