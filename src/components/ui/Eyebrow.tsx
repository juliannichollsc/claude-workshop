import clsx from 'clsx'
import type { ReactNode } from 'react'

export type EyebrowVariant = 'accent' | 'accent-secondary'

interface EyebrowProps {
  children: ReactNode
  variant?: EyebrowVariant
  className?: string
}

const VARIANT_TEXT: Record<EyebrowVariant, string> = {
  accent: 'text-[var(--color-accent)]',
  'accent-secondary': 'text-[var(--color-accent-secondary)]',
}

const VARIANT_DOT: Record<EyebrowVariant, string> = {
  accent: 'bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]',
  'accent-secondary':
    'bg-[var(--color-accent-secondary)] shadow-[0_0_8px_var(--color-accent-secondary)]',
}

/** Chip mono uppercase con dot glow — ancla cada sección. */
export default function Eyebrow({ children, variant = 'accent', className }: EyebrowProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 font-mono text-[0.7rem] font-semibold tracking-[0.25em] uppercase backdrop-blur-xl',
        VARIANT_TEXT[variant],
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', VARIANT_DOT[variant])} aria-hidden="true" />
      {children}
    </span>
  )
}
