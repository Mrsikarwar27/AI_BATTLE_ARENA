import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageContainer } from '@/components/layout/PageContainer'
import { Swords, Scale, Trophy, Sparkles, Github, Linkedin } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'

const GITHUB_URL = 'https://github.com/Mrsikarwar27'
const LINKEDIN_URL = 'https://www.linkedin.com/in/vijay-singh-sikarwar-9b59362a4/'
const GITHUB_AVATAR_URL = 'https://github.com/Mrsikarwar27.png'

// Only technologies actually present in this codebase.
const techBadges = [
  'React 19',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Express',
  'MongoDB',
  'JWT Authentication',
  'REST APIs',
  'LangChain',
  'Persistent Chat History',
]

const steps = [
  { icon: Sparkles, title: 'Enter a Prompt', desc: 'Describe a problem or task for the AI models to solve.' },
  { icon: Swords, title: 'Duel Generation', desc: 'Two AI models (Mistral and Cohere) generate solutions simultaneously.' },
  { icon: Scale, title: 'AI Judgment', desc: 'A Gemini-powered judge evaluates both solutions for quality and correctness.' },
  { icon: Trophy, title: 'Winner Announced', desc: 'See detailed scores, reasoning, and which model performed best.' },
]

function ProfileAvatar() {
  const [failed, setFailed] = useState(false)
  return (
    <div
      aria-label="Profile photo of Vijay Singh Sikarwar"
      className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 border border-primary/15"
    >
      {!failed ? (
        <img
          src={GITHUB_AVATAR_URL}
          alt="Vijay Singh Sikarwar"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="font-heading text-2xl font-bold text-primary">
          VS
        </span>
      )}
    </div>
  )
}

export default function About() {
  return (
    <>
      <PageContainer narrow>
        {/* 1. Project introduction */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center mb-10">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg mx-auto mb-4">
            <Swords className="h-7 w-7 text-on-primary" />
          </div>
          <p className="font-mono text-xs text-primary tracking-[0.2em] uppercase opacity-80 mb-2">
            About the project
          </p>
          <h1 className="font-heading text-3xl font-medium text-on-surface">AI Battle Arena</h1>
          <p className="mt-3 text-on-surface-variant/80 leading-relaxed max-w-xl mx-auto">
            <strong className="font-semibold text-on-surface">AI Battle Arena</strong> is an AI comparison
            and evaluation platform where multiple AI models respond to the same prompt, allowing users
            to compare their answers, performance, and scores in one place.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Technologies used">
            {techBadges.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 text-xs font-mono tracking-wide text-on-surface-variant bg-surface border border-border-subtle rounded-full shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 2. Why it exists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-sm text-center mb-10"
        >
          <h2 className="font-heading text-base font-medium text-on-surface mb-2">Why AI Battle Arena exists</h2>
          <p className="text-sm text-on-surface-variant/75 leading-relaxed max-w-lg mx-auto">
            Built to make AI comparison simple, transparent, and interactive — instead of relying on a
            single model, compare multiple AI responses side by side, scored by a neutral AI judge.
          </p>
        </motion.div>

        {/* How it works (existing content, preserved) */}
        <div className="space-y-4 mb-10">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
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

        {/* 3–7. Developer section */}
        <motion.section
          aria-label="About the developer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 sm:p-8 rounded-2xl bg-surface border border-border-subtle shadow-sm"
        >
          <p className="text-center font-mono text-xs text-on-surface-variant/50 tracking-[0.2em] uppercase mb-5">
            Built by Vijay Singh Sikarwar
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <ProfileAvatar />
            <div className="text-center sm:text-left min-w-0">
              <h2 className="font-heading text-xl font-semibold text-on-surface tracking-tight">
                Vijay Singh Sikarwar
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant/70">
                Software Developer / B.Tech IT Student
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open GitHub profile of Mrsikarwar27 in a new tab"
              className="flex items-center gap-3 p-4 rounded-xl border border-border-subtle bg-surface-container-lowest hover:border-border-default hover:bg-surface-container-low transition-colors"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Github className="h-5 w-5 text-primary" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-medium text-on-surface">GitHub</span>
                <span className="block truncate text-xs text-on-surface-variant/60 font-mono">@Mrsikarwar27</span>
              </span>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open LinkedIn profile of Vijay Singh Sikarwar in a new tab"
              className="flex items-center gap-3 p-4 rounded-xl border border-border-subtle bg-surface-container-lowest hover:border-border-default hover:bg-surface-container-low transition-colors"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Linkedin className="h-5 w-5 text-primary" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-medium text-on-surface">LinkedIn</span>
                <span className="block truncate text-xs text-on-surface-variant/60 font-mono">
                  Vijay Singh Sikarwar
                </span>
              </span>
            </a>
          </div>
        </motion.section>
      </PageContainer>

      <footer className="w-full py-8 border-t border-outline-variant/30">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 max-w-6xl mx-auto gap-3">
          <div className="text-on-surface-variant/60 text-sm">
            &copy; 2026 AI Battle Arena
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
