export interface AIBattleRequest {
  input: string
}

export interface JudgeVerdict {
  solution_1_score: number
  solution_2_score: number
  solution_1_reasoning: string
  solution_2_reasoning: string
}

export interface AIBattleResponse {
  message: string
  success: boolean
  result: {
    problem: string
    solution_1: string
    solution_2: string
    judge: JudgeVerdict
  }
}

export interface AIBattleState {
  problem: string
  solution1: string
  solution2: string
  verdict: JudgeVerdict | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
}

export type ArenaStep = 'input' | 'generating' | 'judging' | 'complete'

export interface User {
  _id: string
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user: User
  token: string
  isAuthenticated: boolean
}

export interface MeResponse {
  success: boolean
  user: User
  isAuthenticated: boolean
}

export type ConversationMessageRole = 'user' | 'assistant' | 'system'

export interface ConversationMessage {
  _id?: string
  role: ConversationMessageRole
  content: string
  createdAt: string
  metadata?: {
    problem?: string
    solution_1?: string
    solution_2?: string
    judge?: JudgeVerdict
    [key: string]: unknown
  }
}

export interface ConversationSummary {
  _id: string
  id: string
  title: string
  preview?: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[]
}

/** A persisted battle derived from a user/assistant message pair. */
export interface PersistedBattle {
  key: string
  problem: string
  solution_1: string
  solution_2: string
  judge: JudgeVerdict
  createdAt?: string
}
