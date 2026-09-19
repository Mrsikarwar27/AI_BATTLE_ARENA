import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function getWinner(
  score1: number,
  score2: number
): { winner: 1 | 2; margin: number; label: string } | null {
  if (score1 === score2) return null
  const winner = score1 > score2 ? 1 : 2
  const margin = Math.abs(score1 - score2)
  const label = margin >= 3 ? 'Dominant' : margin >= 1.5 ? 'Clear' : 'Close'
  return { winner, margin, label }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
