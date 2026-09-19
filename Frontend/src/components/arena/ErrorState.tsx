import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center"
    >
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-error-container border border-error/20 mx-auto mb-4">
        <AlertCircle className="h-7 w-7 text-error" />
      </div>
      <h3 className="font-heading text-lg font-medium text-on-surface mb-2">Something went wrong</h3>
      <p className="text-sm text-on-surface-variant/70 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </motion.div>
  )
}
