import { motion } from 'framer-motion'
import { PageContainer } from '@/components/layout/PageContainer'
import { Swords, Scale, Trophy, Sparkles, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeInUp } from '@/lib/animations'

const steps = [
  { icon: Sparkles, title: 'Enter a Prompt', desc: 'Describe a problem or task for the AI models to solve.' },
  { icon: Swords, title: 'Duel Generation', desc: 'Two AI models (Mistral and Cohere) generate solutions simultaneously.' },
  { icon: Scale, title: 'AI Judgment', desc: 'A Gemini-powered judge evaluates both solutions for quality and correctness.' },
  { icon: Trophy, title: 'Winner Announced', desc: 'See detailed scores, reasoning, and which model performed best.' },
]

export default function About() {
  return (
    <PageContainer narrow>
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center mb-12">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg mx-auto mb-4">
          <Swords className="h-7 w-7 text-on-primary" />
        </div>
        <h1 className="font-heading text-3xl font-medium text-on-surface">About</h1>
        <p className="mt-3 text-on-surface-variant/70 leading-relaxed max-w-md mx-auto">
          A platform where AI models battle head-to-head, judged by a neutral AI.
        </p>
      </motion.div>

      <div className="space-y-4">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-medium text-on-surface">{title}</h3>
              <p className="text-sm text-on-surface-variant/70 mt-1 leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 p-6 rounded-2xl bg-surface border border-border-subtle shadow-sm text-center"
      >
        <h2 className="font-heading text-sm font-medium text-on-surface mb-2">Tech Stack</h2>
        <p className="text-xs text-on-surface-variant/70 leading-relaxed font-mono">
          React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Radix UI · TanStack Query · Recharts
        </p>
        <div className="mt-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </a>
        </div>
      </motion.div>
    </PageContainer>
  )
}
