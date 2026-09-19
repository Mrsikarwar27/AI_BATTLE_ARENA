import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { slideInLeft, slideInRight } from '@/lib/animations'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { Components } from 'react-markdown'

interface ResponseViewerProps {
  content: string
  label: string
  modelName: string
  side: 'left' | 'right'
  score?: number
  loading?: boolean
  delay?: number
}

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')
  const [expanded, setExpanded] = useState(false)
  const lines = code.split('\n').length
  const isLong = lines > 12

  return (
    <div className="relative group rounded-xl overflow-hidden bg-surface-container-high border border-border-subtle my-4">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container border-b border-border-subtle">
        <span className="font-mono text-[11px] text-on-surface-variant/60 tracking-wider uppercase">
          {className?.replace('language-', '') || 'code'}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="flex items-center gap-1.5 text-xs text-on-surface-variant/60 hover:text-on-surface transition-colors font-mono"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-text-positive" />
              <span className="text-text-positive">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className={cn('overflow-x-auto', !expanded && isLong && 'max-h-48')}>
        <pre className="p-4 text-sm font-mono leading-relaxed text-on-surface">
          <code className={cn('text-sm', className)}>{children}</code>
        </pre>
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full py-2 text-xs font-mono text-on-surface-variant/60 hover:text-on-surface bg-surface-container border-t border-border-subtle transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3 mr-1" /> Show less</>
          ) : (
            <><ChevronDown className="h-3 w-3 mr-1" /> Show more ({lines - 12} lines)</>
          )}
        </button>
      )}
    </div>
  )
}

const components: Partial<Components> = {
  code: ({ className, children, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-surface-container-high text-primary text-sm font-mono border border-border-subtle"
          {...props}
        >
          {children}
        </code>
      )
    }
    return <CodeBlock className={className}>{children}</CodeBlock>
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-border-subtle">
      <table className="min-w-full divide-y divide-border-subtle text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-mono text-on-surface-variant/60 uppercase tracking-wider bg-surface-container">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-on-surface border-t border-border-subtle">{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-primary hover:text-primary-container underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/30 pl-4 my-4 italic text-on-surface-variant">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border-subtle" />,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3 text-on-surface">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-3 text-on-surface">{children}</ol>,
  h1: ({ children }) => <h1 className="font-heading text-xl font-medium mt-6 mb-3 text-on-surface">{children}</h1>,
  h2: ({ children }) => <h2 className="font-heading text-lg font-medium mt-5 mb-2 text-on-surface">{children}</h2>,
  h3: ({ children }) => <h3 className="font-heading text-base font-medium mt-4 mb-2 text-on-surface">{children}</h3>,
  p: ({ children }) => <p className="my-3 leading-relaxed text-on-surface/80">{children}</p>,
}

export function ResponseViewer({
  content, label, modelName, side, score, loading, delay = 0,
}: ResponseViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  if (loading) {
    return (
      <motion.div
        variants={side === 'left' ? slideInLeft : slideInRight}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-on-surface">{label}</span>
            </div>
            <span className="font-mono text-xs text-on-surface-variant/60">{modelName}</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-surface-container-high animate-pulse"
              style={{ width: `${70 + Math.random() * 30}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={side === 'left' ? slideInLeft : slideInRight}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden group"
    >
      <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-2.5">
          <div className={cn('h-2 w-2 rounded-full', side === 'left' ? 'bg-primary' : 'bg-primary-container')} />
          <span className="text-sm font-medium text-on-surface">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {score !== undefined && (
            <span className="font-mono text-xs font-semibold text-on-surface">
              Score: <span className={cn(
                score >= 7 ? 'text-text-positive' : score >= 5 ? 'text-text-warning' : 'text-error'
              )}>{score.toFixed(1)}</span>
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 p-1.5 rounded-lg text-on-surface-variant/60 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Copy response"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-text-positive" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <span className="font-mono text-xs text-on-surface-variant/60">{modelName}</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  )
}
