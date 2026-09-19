import { type ReactNode } from 'react'
import { TooltipProvider as RadixTooltipProvider } from '@/components/ui/tooltip'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltipProvider delayDuration={300} skipDelayDuration={100}>
      {children}
    </RadixTooltipProvider>
  )
}
