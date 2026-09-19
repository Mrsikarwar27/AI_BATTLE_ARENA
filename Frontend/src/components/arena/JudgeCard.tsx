import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getWinner } from '@/lib/utils'
import { containerVariants, itemVariants, springBouncy } from '@/lib/animations'
import { Badge } from '@/components/ui/badge'
import {
  Trophy, Scale, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, BrainCircuit, Copy, Check,
} from 'lucide-react'
import type { JudgeVerdict } from '@/types'

interface JudgeCardProps {
  verdict: JudgeVerdict
  model1Name: string
  model2Name: string
}

function AnimatedScore({
  score, maxScore = 10, label, color = 'primary', delay = 0,
}: {
  score: number; maxScore?: number; label: string; color?: 'primary' | 'accent'; delay?: number
}) {
  const [displayed, setDisplayed] = useState(0)
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      countRef.current = setInterval(() => {
        setDisplayed((prev) => {
          if (prev >= score) {
            if (countRef.current) clearInterval(countRef.current)
            return score
          }
          return prev + 0.1
        })
      }, 30)
    }, delay * 1000)
    return () => {
      clearTimeout(timer)
      if (countRef.current) clearInterval(countRef.current)
    }
  }, [score, delay])

  const percentage = (displayed / maxScore) * 100
  const isPrimary = color === 'primary'

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-xs text-on-surface-variant/60 uppercase tracking-wider">{label}</span>
      <div className="relative">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springBouncy, delay: delay + 0.3 }}
          className={cn(
            'text-5xl sm:text-6xl font-bold font-heading tabular-nums',
            isPrimary ? 'text-primary' : 'text-primary-container'
          )}
        >
          {displayed.toFixed(1)}
        </motion.span>
        <span className="text-lg text-on-surface-variant/40 font-medium">/{maxScore}</span>
      </div>
      <div className="w-full max-w-[160px] h-1.5 rounded-full bg-surface-container overflow-hidden mt-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: delay + 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn('h-full rounded-full', isPrimary ? 'bg-primary' : 'bg-primary-container')}
        />
      </div>
    </div>
  )
}

function ComparisonChart({ score1, score2 }: { score1: number; score2: number }) {
  return (
    <div className="space-y-4">
      {[
        { label: 'Model 1', score: score1, color: 'bg-primary' },
        { label: 'Model 2', score: score2, color: 'bg-primary-container' },
      ].map(({ label, score, color }) => (
        <div key={label} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{label}</span>
            <span className="font-mono text-on-surface font-medium">{score.toFixed(1)}/10</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-container overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score / 10) * 100}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn('h-full rounded-full', color)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function extractPoints(reasoning: string): string[] {
  const lines = reasoning.split('\n').filter(Boolean)
  const points = lines
    .filter((l) => /^\s*[-*•]\s/.test(l) || /^\s*\d+[.)]\s/.test(l))
    .map((l) => l.replace(/^\s*[-*•]\s/, '').replace(/^\s*\d+[.)]\s/, ''))
  return points.length > 0 ? points.slice(0, 5) : ['No specific points extracted']
}

function ProsCons({
  solution1Reasoning, solution2Reasoning, winner,
}: {
  solution1Reasoning: string; solution2Reasoning: string; winner: 1 | 2 | null
}) {
  const s1Points = extractPoints(solution1Reasoning)
  const s2Points = extractPoints(solution2Reasoning)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2].map((side) => {
        const points = side === 1 ? s1Points : s2Points
        const isWinner = winner === side
        return (
          <motion.div
            key={side}
            variants={itemVariants}
            className={cn(
              'rounded-xl p-5 border',
              isWinner
                ? 'border-primary/20 bg-primary-fixed/30'
                : 'border-border-subtle bg-surface-container-low'
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              {isWinner && <Trophy className="h-4 w-4 text-primary" />}
              <span className={cn('text-sm font-medium', isWinner ? 'text-on-primary-fixed' : 'text-on-surface')}>
                Model {side}{isWinner && ' (Winner)'}
              </span>
            </div>
            <ul className="space-y-1.5">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-text-positive mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )
      })}
    </div>
  )
}

function ReasoningBlock({ label, reasoning }: { label: string; reasoning: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = reasoning.length > 200

  return (
    <motion.div variants={itemVariants} className="rounded-xl bg-surface-container-low p-5 border border-border-subtle">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-on-surface">{label}</span>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-on-surface-variant/60 hover:text-on-surface transition-colors font-mono"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> More</>}
          </button>
        )}
      </div>
      <p className={cn('text-sm leading-relaxed text-on-surface/70', !expanded && isLong && 'line-clamp-3')}>
        {reasoning}
      </p>
    </motion.div>
  )
}

export function JudgeCard({ verdict, model1Name, model2Name }: JudgeCardProps) {
  const { solution_1_score: s1, solution_2_score: s2 } = verdict
  const result = getWinner(s1, s2)
  const isTie = !result
  const [showReasoning, setShowReasoning] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = `Judge's Verdict:\n${model1Name}: ${s1.toFixed(1)}/10\n${model2Name}: ${s2.toFixed(1)}/10\nWinner: ${isTie ? 'Tie' : `Model ${result!.winner}`}\n\n${model1Name} Reasoning:\n${verdict.solution_1_reasoning}\n\n${model2Name} Reasoning:\n${verdict.solution_2_reasoning}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-3xl bg-surface border border-border-subtle shadow-sm overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="p-6 sm:p-8 border-b border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-lg font-medium text-on-surface">Judge&rsquo;s Verdict</h2>
            <p className="text-sm text-on-surface-variant/70">AI evaluation complete</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 p-2 rounded-lg text-on-surface-variant/60 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Copy verdict"
          >
            {copied ? <Check className="h-4 w-4 text-text-positive" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isTie && result && (
            <motion.div
              key={result.winner}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springBouncy, delay: 0.8 }}
              className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-primary-fixed/50 to-primary-fixed-dim/30 border border-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container shadow-lg">
                  <Trophy className="h-7 w-7 text-on-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-base font-semibold text-on-primary-fixed">
                      Model {result.winner} Wins
                    </span>
                    <Badge variant="accent">{result.label}</Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {result.winner === 1 ? model1Name : model2Name} outperformed with a margin of {result.margin.toFixed(1)} points
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {isTie && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-6 rounded-2xl bg-warning/10 border border-warning/30"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-text-warning" />
                <div>
                  <span className="font-heading text-base font-semibold text-text-warning">It&rsquo;s a Tie!</span>
                  <p className="text-sm text-text-warning/70 mt-0.5">
                    Both models scored equally at {s1.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Score Comparison */}
      <motion.div variants={itemVariants} className="p-6 sm:p-8 border-b border-border-subtle">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 max-w-md mx-auto">
          <AnimatedScore score={s1} label={model1Name} color="primary" delay={0.5} />
          <AnimatedScore score={s2} label={model2Name} color="accent" delay={0.8} />
        </div>
      </motion.div>

      {/* Comparison Chart */}
      <motion.div variants={itemVariants} className="p-6 sm:p-8 border-b border-border-subtle">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-on-surface-variant/60" />
          <span className="font-heading text-sm font-medium text-on-surface">Score Comparison</span>
        </div>
        <ComparisonChart score1={s1} score2={s2} />
      </motion.div>

      {/* Pros & Cons */}
      <motion.div variants={itemVariants} className="p-6 sm:p-8 border-b border-border-subtle">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-4 w-4 text-on-surface-variant/60" />
          <span className="font-heading text-sm font-medium text-on-surface">Analysis</span>
        </div>
        <ProsCons
          solution1Reasoning={verdict.solution_1_reasoning}
          solution2Reasoning={verdict.solution_2_reasoning}
          winner={result?.winner ?? null}
        />
      </motion.div>

      {/* Reasoning */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="w-full flex items-center justify-between px-6 sm:px-8 py-4 text-sm text-on-surface-variant hover:text-on-surface transition-colors bg-surface-container-low"
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span className="font-heading font-medium">Detailed Reasoning</span>
          </div>
          {showReasoning ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <AnimatePresence>
          {showReasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 sm:px-8 pb-6 space-y-3 pt-4">
                <ReasoningBlock label={`${model1Name} Reasoning`} reasoning={verdict.solution_1_reasoning} />
                <ReasoningBlock label={`${model2Name} Reasoning`} reasoning={verdict.solution_2_reasoning} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
