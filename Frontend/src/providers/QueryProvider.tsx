import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

/** Clear private conversation cache so the next login never sees the previous user. */
export function clearConversationCache(): void {
  queryClient.removeQueries({ queryKey: ['conversations'] })
  queryClient.removeQueries({ queryKey: ['conversation'] })
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
