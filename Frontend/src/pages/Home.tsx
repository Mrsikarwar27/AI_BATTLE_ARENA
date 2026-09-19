import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, RefreshCw } from 'lucide-react'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { PromptInput } from '@/components/arena/PromptInput'
import { ResponseViewer } from '@/components/arena/ResponseViewer'
import { JudgeCard } from '@/components/arena/JudgeCard'
import { ErrorState } from '@/components/arena/ErrorState'
import { ThinkingAnimation } from '@/components/arena/ThinkingAnimation'
import { useArenaBattle } from '@/hooks/useArenaBattle'
import { Button } from '@/components/ui/button'

const MODEL_1_NAME = 'Mistral'
const MODEL_2_NAME = 'Cohere'

export default function Home() {
  const [prompt, setPrompt] = useState<string | null>(null)
  const { mutate, isPending, data, error, reset } = useArenaBattle()
  const [step, setStep] = useState<'models' | 'judge'>('models')
  const resultRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = useCallback(
    (input: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setPrompt(input)
      setStep('models')
      reset()
      timerRef.current = setTimeout(() => setStep('judge'), 500)
      mutate(
        { input },
        {
          onError: () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            setStep('models')
          },
          onSettled: () => {
            if (timerRef.current) clearTimeout(timerRef.current)
          },
        }
      )
    },
    [mutate, reset]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const isLoading = isPending
  const hasResult = Boolean(data?.success && data.result)

  // Smooth-scroll to loading / results for a responsive feel
  useEffect(() => {
    if ((isLoading || hasResult) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isLoading, hasResult])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPrompt(null)
    reset()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [reset])

  return (
    <>
      <main className="relative min-h-screen pt-10 pb-16 scroll-smooth">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header — minimal, static (no blur filter for perf) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-center mb-8 space-y-3"
          >
            <span className="font-mono text-xs text-primary tracking-[0.2em] uppercase opacity-80">
              Model Comparison
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-on-surface tracking-tight leading-tight">
              Compare <span className="text-primary">Two Models</span>
            </h1>
            <p className="text-base text-on-surface-variant max-w-xl mx-auto opacity-70 leading-relaxed">
              Enter a prompt. {MODEL_1_NAME} and {MODEL_2_NAME} respond side-by-side, judged by AI.
            </p>
          </motion.div>

          {/* Prompt — always visible, compact after submit */}
          <div className="max-w-3xl mx-auto mb-10 scroll-mt-24">
            <PromptInput onSubmit={handleSubmit} disabled={isLoading} />
          </div>

          <div ref={resultRef} className="scroll-mt-24" />

          {/* Loading */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="max-w-xl mx-auto">
                  <ThinkingAnimation
                    step={step}
                    model1Name={MODEL_1_NAME}
                    model2Name={MODEL_2_NAME}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {[MODEL_1_NAME, MODEL_2_NAME].map((m) => (
                    <div
                      key={m}
                      className="rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden"
                    >
                      <div className="px-5 py-3.5 border-b border-border-subtle bg-surface-container-low">
                        <Skeleton className="h-5 w-28" />
                      </div>
                      <div className="p-5 space-y-3">
                        <SkeletonText lines={6} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto"
              >
                <ErrorState
                  message={error?.message || 'An unexpected error occurred'}
                  onRetry={() => prompt && handleSubmit(prompt)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results — only necessary parts */}
          <AnimatePresence mode="wait">
            {hasResult && !isLoading && !error && data?.result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-heading text-xl text-on-surface">Responses</h2>
                    <p className="text-sm text-on-surface-variant/70 mt-1 break-words">
                      Responses to: &ldquo;{data.result.problem}&rdquo;
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleReset} className="shrink-0">
                    <RefreshCw className="h-4 w-4" />
                    New Comparison
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                  <div className="min-w-0">
                    <ResponseViewer
                      content={data.result.solution_1}
                      label="Model A"
                      modelName={MODEL_1_NAME}
                      side="left"
                      score={data.result.judge.solution_1_score}
                      delay={0}
                    />
                  </div>
                  <div className="min-w-0">
                    <ResponseViewer
                      content={data.result.solution_2}
                      label="Model B"
                      modelName={MODEL_2_NAME}
                      side="right"
                      score={data.result.judge.solution_2_score}
                      delay={0}
                    />
                  </div>
                </div>

                <JudgeCard
                  verdict={data.result.judge}
                  model1Name={MODEL_1_NAME}
                  model2Name={MODEL_2_NAME}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty */}
          {!prompt && !isLoading && !hasResult && !error && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center max-w-md mx-auto mt-10"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/5 border border-primary/10 mx-auto mb-3">
                <Swords className="h-5 w-5 text-primary/60" />
              </div>
              <h3 className="font-heading text-base text-on-surface mb-1">Ready to compare</h3>
              <p className="text-sm text-on-surface-variant/70 leading-relaxed">
                Enter a prompt above. Both models answer, and a judge scores them.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="w-full py-8 border-t border-outline-variant/30">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 max-w-6xl mx-auto gap-3">
          <div className="text-on-surface-variant/60 text-sm">
            &copy; 2024
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant/40">
            <span className="font-mono text-xs">SYSTEM STABLE</span>
            <span className="w-2 h-2 bg-text-positive rounded-full animate-pulse" />
          </div>
        </div>
      </footer>
    </>
  )
}
