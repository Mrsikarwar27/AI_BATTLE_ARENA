import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'

interface PageContainerProps {
  children: ReactNode
  className?: string
  narrow?: boolean
}

export function PageContainer({ children, className, narrow }: PageContainerProps) {
  return (
    <motion.main
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn(
        'mx-auto px-5 md:px-16 py-8',
        narrow ? 'max-w-[800px]' : 'max-w-[1280px]',
        className
      )}
    >
      {children}
    </motion.main>
  )
}
