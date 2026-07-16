import type { HowItWorksStep } from '../../types/cv'

interface TimelineProps {
  steps: readonly HowItWorksStep[]
}

/**
 * Secuencia de pasos centrada. El número (01–05) es un badge sobre el título:
 * codifica el orden real del ciclo sin depender de un riel lateral que rompería
 * el centrado del resto de la página.
 */
export default function Timeline({ steps }: TimelineProps) {
  return (
    <ol className="flex flex-col gap-5">
      {steps.map((step) => (
        <li
          key={step.n}
          className="timeline-step flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[var(--color-accent)]/40"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-accent)]/50 bg-[var(--color-bg)] font-mono text-xs text-[var(--color-accent)] shadow-[0_0_14px_var(--color-accent)]/60"
            aria-hidden="true"
          >
            {step.n}
          </span>
          <h3 className="font-display text-lg font-bold tracking-tight text-[var(--color-text)] md:text-xl">
            {step.title}
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
            {step.desc}
          </p>
        </li>
      ))}
    </ol>
  )
}
