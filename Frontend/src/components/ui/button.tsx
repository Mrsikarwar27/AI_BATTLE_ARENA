import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-primary text-on-primary hover:bg-on-primary-fixed-variant shadow-sm active:scale-[0.98]',
  secondary:
    'bg-surface-container-low text-on-surface border border-border-default hover:bg-surface-container transition-colors',
  ghost:
    'text-on-surface-variant hover:text-on-surface hover:bg-primary/5 transition-colors',
  outline:
    'border border-border-default text-on-surface hover:bg-surface-container-low transition-colors',
  danger:
    'bg-error-container text-on-error-container border border-error/20 hover:bg-error/10 transition-colors',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-8 text-base gap-2 rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-all duration-300',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none select-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
