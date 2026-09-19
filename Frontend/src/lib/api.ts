import axios from 'axios'
import type { AIBattleRequest, AIBattleResponse } from '@/types'

const client = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
})

export async function invokeBattle(data: AIBattleRequest): Promise<AIBattleResponse> {
  try {
    const response = await client.post<AIBattleResponse>('/invoke', data)
    return response.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const serverMessage = (err.response?.data as { message?: string } | undefined)?.message
      const status = err.response?.status
      if (status === 429) {
        throw new Error(
          serverMessage || 'Rate limit exceeded. Wait about a minute and try again.'
        )
      }
      if (serverMessage) {
        throw new Error(serverMessage)
      }
      throw new Error(err.message || 'Battle request failed')
    }
    throw err
  }
}
