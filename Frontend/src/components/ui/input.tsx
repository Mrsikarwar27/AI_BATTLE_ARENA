import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-11 w-full rounded-xl bg-surface-container-lowest border px-4 text-sm',
          'text-on-surface placeholder:text-on-surface-variant/40',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          invalid
            ? 'border-error/50 focus:border-error/60 focus:ring-error/15'
            : 'border-border-default hover:border-border-strong',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-on-surface mb-1.5"
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-error ml-0.5">
          *
        </span>
      )}
    </label>
  )
}

export function FieldError({ message, id }: { message?: string; id: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-error leading-relaxed">
      {message}
    </p>
  )
}
