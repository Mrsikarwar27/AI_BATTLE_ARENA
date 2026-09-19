import { useReducedMotion as useFmReducedMotion } from 'framer-motion'

export function useReducedMotion(): boolean {
  return useFmReducedMotion() ?? false
}
