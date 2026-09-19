import { forwardRef, type HTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'

type CardProps = HTMLMotionProps<'div'> & {
  glass?: boolean
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, hover, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        whileHover={hover ? { y: -4, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } } : undefined}
        className={cn(
          'rounded-2xl overflow-hidden transition-all duration-300',
          glass
            ? 'glass-panel hero-glow'
            : 'bg-surface-container-lowest border border-border-subtle shadow-sm',
          hover && 'cursor-pointer hover:shadow-lg hover:border-border-default',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-6 pb-0', className)}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
