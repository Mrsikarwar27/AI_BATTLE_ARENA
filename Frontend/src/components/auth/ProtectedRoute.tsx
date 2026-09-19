import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function AuthLoading() {
  return (
    <main className="mx-auto max-w-[1280px] px-5 md:px-16 py-16">
      <div className="max-w-md mx-auto rounded-2xl bg-surface border border-border-subtle shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-2/3 rounded-lg bg-surface-container" />
          <div className="h-4 w-full rounded-lg bg-surface-container" />
          <div className="h-10 w-full rounded-xl bg-surface-container" />
          <div className="h-10 w-full rounded-xl bg-surface-container" />
        </div>
        <p className="sr-only" role="status">
          Loading…
        </p>
      </div>
    </main>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthLoading />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <AuthLoading />
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
