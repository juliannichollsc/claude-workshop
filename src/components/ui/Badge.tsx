import clsx from 'clsx'
import type { ReactNode } from 'react'

export type BadgeVariant = 'frontier' | 'flagship' | 'balanced' | 'fast' | 'muted'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

// La intensidad del pill codifica la capacidad del modelo: `frontier` es el único
// relleno sólido, y de ahí baja hasta el borde apagado de `fast`.
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  frontier:
    'bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)] shadow-[0_0_16px_var(--color-accent)]/50',
  flagship: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/40',
  balanced:
    'bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)]/40',
  fast: 'bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]',
  muted: 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]',
}

/** Pill de estado/tier — color-coded, sin cyan/violet de Tailwind. */
export default function Badge({ children, variant = 'muted', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.7rem] font-semibold tracking-wide uppercase',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
