import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sparkles, Scale, ArrowRight } from 'lucide-react'

interface ThinkingAnimationProps {
  step: 'models' | 'judge'
  model1Name?: string
  model2Name?: string
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60"
      animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
      transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <Dot delay={0} />
      <Dot delay={0.2} />
      <Dot delay={0.4} />
    </span>
  )
}

export function ThinkingAnimation({ step, model1Name = 'Model A', model2Name = 'Model B' }: ThinkingAnimationProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border transition-all duration-500',
            step === 'models'
              ? 'bg-primary-fixed/30 border-primary/20'
              : step === 'judge'
                ? 'bg-surface-container-low border-border-subtle opacity-60'
                : 'bg-surface-container-low border-border-subtle opacity-40'
          )}
        >
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            step === 'models' ? 'bg-primary/10' : 'bg-surface-container'
          )}>
            <Sparkles className={cn('h-4 w-4', step === 'models' ? 'text-primary' : 'text-on-surface-variant/60')} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', step === 'models' ? 'text-on-primary-fixed' : 'text-on-surface')}>
                Models generating responses
              </span>
              {step === 'models' && <ThinkingDots />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-on-surface-variant/70">{model1Name}</span>
              <ArrowRight className="h-3 w-3 text-on-surface-variant/40" />
              <span className="font-mono text-xs text-on-surface-variant/70">{model2Name}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border transition-all duration-500',
            step === 'judge'
              ? 'bg-primary-fixed/30 border-primary/20'
              : 'bg-surface-container-low border-border-subtle opacity-40'
          )}
        >
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            step === 'judge' ? 'bg-primary/10' : 'bg-surface-container'
          )}>
            <Scale className={cn('h-4 w-4', step === 'judge' ? 'text-primary' : 'text-on-surface-variant/60')} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', step === 'judge' ? 'text-on-primary-fixed' : 'text-on-surface')}>
                Judge evaluating responses
              </span>
              {step === 'judge' && <ThinkingDots />}
            </div>
            <p className="font-mono text-xs text-on-surface-variant/70 mt-1">
              Analyzing quality, correctness, and completeness
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div className="mt-6 h-1.5 rounded-full bg-surface-container overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
          initial={{ width: '0%' }}
          animate={{ width: step === 'models' ? '45%' : '85%' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </div>
  )
}
