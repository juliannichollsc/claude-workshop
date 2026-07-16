import clsx from 'clsx'

interface MetricProps {
  value: string
  label: string
  className?: string
}

/** Número display gigante + label — para datos cuantitativos (tokens, tiempos). */
export default function Metric({ value, label, className }: MetricProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center backdrop-blur-xl transition hover:-translate-y-1 hover:border-[var(--color-accent)]/40 md:p-8',
        className,
      )}
    >
      <p className="font-display bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] bg-clip-text text-4xl leading-none font-bold tracking-tight text-transparent md:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-sm leading-snug text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}
