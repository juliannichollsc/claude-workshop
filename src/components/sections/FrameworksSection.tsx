import { useRef } from 'react'
import clsx from 'clsx'
import { content } from '../../data/cv'
import { useReveal } from '../../hooks/useReveal'
import type { EffortLevel, ModelTier } from '../../types/cv'
import Eyebrow from '../ui/Eyebrow'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Section from '../ui/Section'

const { models } = content

const TIER_LABEL: Record<ModelTier, string> = {
  frontier: 'El más capaz',
  flagship: 'Flagship',
  balanced: 'Balanceado',
  fast: 'Rápido',
}

const EFFORT_FILL: Record<EffortLevel, number> = { low: 1, medium: 2, high: 3, xhigh: 4, max: 5 }
const EFFORT_BARS = [0, 1, 2, 3, 4]

export default function FrameworksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <Section
      sectionRef={sectionRef}
      decoration={
        <div
          className="pointer-events-none absolute top-1/4 right-[6%] -z-[1] h-[34rem] w-[34rem] rounded-full bg-[var(--color-accent-secondary)] opacity-[0.06] blur-[130px]"
          aria-hidden="true"
        />
      }
    >
      <header className="flex flex-col items-center text-center">
        <Eyebrow variant="accent-secondary" className="reveal">
          {models.eyebrow}
        </Eyebrow>
        <h2 className="reveal font-display mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--color-text)] md:text-5xl">
          {models.title}
        </h2>
        <p className="reveal mt-4 text-lg text-[var(--color-text-muted)]">{models.subtitle}</p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
        <div className="space-y-4">
          {models.tiers.map((tier) => (
            <Card key={tier.name} className="reveal">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-text)]">
                  {tier.name}
                </h3>
                <Badge variant={tier.tier}>{TIER_LABEL[tier.tier]}</Badge>
                <span className="font-mono text-xs tracking-wide text-[var(--color-text-muted)]">
                  {tier.context} ctx
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{tier.for}</p>
            </Card>
          ))}
        </div>

        <Card hoverable={false} className="reveal">
          <p className="font-mono text-[0.7rem] font-semibold tracking-[0.25em] text-[var(--color-accent-secondary)] uppercase">
            effort · cuánto razona
          </p>
          <ul className="mx-auto mt-5 max-w-sm space-y-4 text-left">
            {models.effort.map((item) => (
              <li key={item.level} className="flex items-center gap-4">
                <span className="flex items-end gap-1" aria-hidden="true">
                  {EFFORT_BARS.map((k) => (
                    <span
                      key={k}
                      className={clsx(
                        'w-1 rounded-sm',
                        k < EFFORT_FILL[item.level] ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]',
                      )}
                      style={{ height: `${6 + k * 4}px` }}
                    />
                  ))}
                </span>
                <span className="font-mono w-16 shrink-0 text-xs font-medium tracking-wide text-[var(--color-text)] uppercase">
                  {item.level}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">{item.when}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="reveal mt-8 flex items-start justify-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span className="mt-0.5 text-[var(--color-accent)]">▲</span>
        <span>{models.caption}</span>
      </p>
    </Section>
  )
}
