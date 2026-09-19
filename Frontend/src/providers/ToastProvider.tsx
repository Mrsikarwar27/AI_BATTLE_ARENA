import { type ReactNode } from 'react'
import { ToastProvider as RadixToastProvider, ToastViewport } from '@/components/ui/toast'

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <RadixToastProvider duration={4000}>
      {children}
      <ToastViewport />
    </RadixToastProvider>
  )
}
