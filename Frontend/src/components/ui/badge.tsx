import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'winner'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-container text-on-surface-variant',
  success: 'bg-text-positive/10 text-text-positive border border-text-positive/20',
  warning: 'bg-text-warning/10 text-text-warning border border-text-warning/20',
  danger: 'bg-error/10 text-error border border-error/20',
  accent: 'bg-primary-fixed text-on-primary-fixed border border-primary/20',
  winner: 'bg-gradient-to-r from-primary-container/20 to-primary-fixed text-on-primary-fixed border border-primary/20',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono tracking-wider',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'
