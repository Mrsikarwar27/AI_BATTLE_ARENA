import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import {
  createConversationApi,
  deleteConversationApi,
  fetchConversationApi,
  fetchConversations,
  postConversationMessageApi,
  renameConversationApi,
} from '@/lib/api'

export function useConversations(search?: string) {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const query = useQuery({
    queryKey: ['conversations', user?.id ?? 'anon', search?.trim() ?? ''],
    queryFn: () => fetchConversations(search),
    // Only fetch private history for authenticated users.
    enabled: isAuthenticated && !authLoading,
    staleTime: 1000 * 30,
  })
  return query
}

export function useConversationDetail(id: string | null) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => fetchConversationApi(id as string),
    enabled: Boolean(isAuthenticated && id),
    staleTime: 1000 * 30,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title?: string) => createConversationApi(title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useRenameConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameConversationApi(id, title),
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
      void queryClient.invalidateQueries({ queryKey: ['conversation', vars.id] })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteConversationApi(id),
    onSuccess: (_d, id) => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.removeQueries({ queryKey: ['conversation', id] })
    },
  })
}

export function usePostConversationMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: string }) => postConversationMessageApi(id, input),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] })
      void queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] })
    },
  })
}
