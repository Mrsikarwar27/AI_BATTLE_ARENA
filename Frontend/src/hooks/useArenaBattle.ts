import { useMutation } from '@tanstack/react-query'
import { invokeBattle } from '@/lib/api'
import type { AIBattleRequest } from '@/types'

export function useArenaBattle() {
  return useMutation({
    mutationFn: (data: AIBattleRequest) => invokeBattle(data),
    retry: false,
  })
}
