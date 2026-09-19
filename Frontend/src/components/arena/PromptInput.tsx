import { useState, useRef, useCallback, type KeyboardEvent, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowUp, Square, Sparkles } from 'lucide-react'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
  placeholder?: string
}

const examplePrompts = [
  'Write a function to merge two sorted arrays',
  'Build a React hook for debouncing',
  'Explain how garbage collection works',
]

export function PromptInput({
  onSubmit,
  disabled,
  placeholder = 'Enter your prompt...',
}: PromptInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [showExamples, setShowExamples] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = '0'
      el.style.height = `${Math.min(el.scrollHeight, 320)}px`
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setShowExamples(false)
  }, [value, disabled, onSubmit])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence>
        {showExamples && !value && !focused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap justify-center gap-2 mb-6"
          >
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setValue(prompt)
                  setShowExamples(false)
                  textareaRef.current?.focus()
                }}
                className="px-3 py-1.5 text-xs text-on-surface-variant/60 hover:text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-full border border-border-subtle hover:border-border-default transition-all duration-200 font-mono tracking-wider"
              >
                {prompt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleSubmit() }} className="relative">
        <motion.div
          className={`relative rounded-3xl overflow-hidden bg-surface border border-border-subtle transition-shadow duration-300 ${focused ? 'shadow-input-focus' : 'shadow-hero'}`}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); adjustHeight() }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className={cn(
              'w-full resize-none bg-transparent px-6 py-5 pr-16',
              'text-base sm:text-lg leading-relaxed',
              'text-on-surface placeholder:text-on-surface-variant/30',
              'focus:outline-none focus:ring-0',
              'disabled:opacity-50 transition-opacity',
              'min-h-[60px] max-h-[320px]'
            )}
            aria-label="Enter your prompt"
          />

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <span className="text-[11px] text-on-surface-variant/30 select-none hidden sm:block font-mono">
              {value.length > 0 && `${value.length} chars`}
              {value.length > 0 && ' · '}
              <kbd className="px-1 py-0.5 rounded bg-surface-container text-[10px] font-mono">⏎</kbd>
            </span>

            <motion.button
              type="submit"
              disabled={!value.trim() || disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200',
                value.trim() && !disabled
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container text-on-surface-variant/50'
              )}
              aria-label="Submit prompt"
            >
              {disabled ? <Square className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            </motion.button>
          </div>
        </motion.div>

        {!disabled && value.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-3"
          >
            <Sparkles className="h-3 w-3 text-primary/50" />
            <span className="text-xs text-on-surface-variant/50 font-mono tracking-wider">
              Two AI models will respond. A judge will evaluate both.
            </span>
          </motion.div>
        )}
      </form>
    </div>
  )
}
