import { motion } from 'framer-motion'
import { PageContainer } from '@/components/layout/PageContainer'
import { Clock, Swords } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'

export default function History() {
  return (
    <PageContainer narrow>
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center py-20">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-surface border border-border-subtle shadow-sm mx-auto mb-4">
          <Clock className="h-8 w-8 text-on-surface-variant/60" />
        </div>
        <h2 className="font-heading text-xl font-medium text-on-surface mb-2">Battle History</h2>
        <p className="text-sm text-on-surface-variant/70 max-w-sm mx-auto leading-relaxed">
          Your previous battles will appear here. Start your first battle to see history.
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 font-mono text-xs text-on-surface-variant/40">
          <Swords className="h-3 w-3" />
          <span>No battles yet</span>
        </div>
      </motion.div>
    </PageContainer>
  )
}
