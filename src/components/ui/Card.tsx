import clsx from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Eleva en hover con glow de borde — desactivar en cards puramente decorativas. */
  hoverable?: boolean
}

/**
 * Panel glass legible sobre el fondo 3D animado.
 *
 * Padding en la misma escala que el resto de cards (Metric, Timeline): 24px, 32px en ≥md.
 */
export default function Card({ children, className, hoverable = true }: CardProps) {
  return (
    <div
      className={clsx(
        'glass rounded-2xl p-6 shadow-2xl shadow-black/40 md:p-8',
        hoverable &&
          'transition duration-300 ease-out hover:-translate-y-1 hover:border-[var(--color-accent)]/45',
        className,
      )}
    >
      {children}
    </div>
  )
}
