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
