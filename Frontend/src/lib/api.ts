import axios from 'axios'
import type {
  AIBattleRequest,
  AIBattleResponse,
  AuthResponse,
  ConversationDetail,
  ConversationSummary,
  MeResponse,
  User,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TOKEN_KEY = 'aba_token'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable (private mode) — auth still works via HttpOnly cookie
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
  withCredentials: true,
})

// Attach bearer token when present (cookie is sent automatically as well)
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (err.message) return err.message
  }
  return fallback
}

export async function invokeBattle(data: AIBattleRequest): Promise<AIBattleResponse> {
  try {
    const response = await apiClient.post<AIBattleResponse>('/invoke', data)
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

export interface SignupPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export async function signupApi(payload: SignupPayload): Promise<AuthResponse> {
  try {
    const res = await apiClient.post<AuthResponse>('/api/auth/signup', payload)
    if (res.data.token) setStoredToken(res.data.token)
    return res.data
  } catch (err) {
    throw new Error(extractMessage(err, 'Signup failed. Please try again.'))
  }
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', payload)
    if (res.data.token) setStoredToken(res.data.token)
    return res.data
  } catch (err) {
    throw new Error(extractMessage(err, 'Login failed. Please try again.'))
  }
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<MeResponse>('/api/auth/me')
  return res.data.user
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout')
  } catch {
    // logout is best-effort — always clear local state
  } finally {
    setStoredToken(null)
  }
}

export function isAuthError(err: unknown): boolean {
  if (axios.isAxiosError(err)) return err.response?.status === 401
  if (err instanceof Error) return /401|unauthor|session expired|log in/i.test(err.message)
  return false
}

function conversationError(err: unknown, fallback: string): Error {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data as { message?: string } | undefined
    if (status === 401) return new Error('Session expired. Please log in again.')
    if (data?.message) return new Error(data.message)
    if (err.message) return new Error(err.message)
  }
  return new Error(fallback)
}

// ---- Persistent conversation history (MongoDB source of truth) ----

export interface ConversationsListResponse {
  success: boolean
  conversations: ConversationSummary[]
}

export interface ConversationResponse {
  success: boolean
  message?: string
  conversation: ConversationDetail
}

export interface ConversationMessageResponse {
  success: boolean
  message: string
  conversationId: string
  conversationTitle: string
  result: AIBattleResponse['result']
}

export async function fetchConversations(search?: string): Promise<ConversationSummary[]> {
  try {
    const params = search?.trim() ? { search: search.trim().slice(0, 100) } : {}
    const res = await apiClient.get<ConversationsListResponse>('/api/conversations', { params })
    return res.data.conversations ?? []
  } catch (err) {
    throw conversationError(err, 'Could not load conversations. Please try again.')
  }
}

export async function createConversationApi(title?: string): Promise<ConversationDetail> {
  try {
    const res = await apiClient.post<ConversationResponse>('/api/conversations', title ? { title } : {})
    return res.data.conversation
  } catch (err) {
    throw conversationError(err, 'Could not create conversation. Please try again.')
  }
}

export async function fetchConversationApi(id: string): Promise<ConversationDetail> {
  try {
    const res = await apiClient.get<ConversationResponse>(`/api/conversations/${encodeURIComponent(id)}`)
    return res.data.conversation
  } catch (err) {
    throw conversationError(err, 'Could not load conversation. Please try again.')
  }
}

export async function renameConversationApi(id: string, title: string): Promise<void> {
  try {
    await apiClient.patch(`/api/conversations/${encodeURIComponent(id)}`, { title })
  } catch (err) {
    throw conversationError(err, 'Could not rename conversation. Please try again.')
  }
}

export async function deleteConversationApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/conversations/${encodeURIComponent(id)}`)
  } catch (err) {
    throw conversationError(err, 'Could not delete conversation. Please try again.')
  }
}

export async function postConversationMessageApi(
  id: string,
  input: string
): Promise<ConversationMessageResponse> {
  try {
    const res = await apiClient.post<ConversationMessageResponse>(
      `/api/conversations/${encodeURIComponent(id)}/messages`,
      { input }
    )
    return res.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const serverMessage = (err.response?.data as { message?: string } | undefined)?.message
      if (status === 429) throw new Error(serverMessage || 'Rate limit exceeded. Wait about a minute and try again.')
      if (status === 401) throw new Error('Session expired. Please log in again.')
      if (serverMessage) throw new Error(serverMessage)
      throw new Error(err.message || 'Battle request failed')
    }
    throw err
  }
}
