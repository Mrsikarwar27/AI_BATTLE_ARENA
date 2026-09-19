import type { Variants, Transition } from 'framer-motion'

export const spring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
}

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
  mass: 0.8,
}

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
  mass: 0.6,
}

export const easeOut: Transition = {
  ease: [0.16, 1, 0.3, 1],
  duration: 0.5,
}

export const easeInOut: Transition = {
  ease: [0.76, 0, 0.24, 1],
  duration: 0.4,
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: easeOut },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: easeOut },
}

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: easeOut },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: easeOut },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: easeOut },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: springGentle,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: springGentle,
  },
  tap: {
    scale: 0.98,
    transition: springGentle,
  },
}

export const scaleOnHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
}
