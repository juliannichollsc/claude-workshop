import { useRef } from 'react'
import { content } from '../../data/cv'
import { useReveal } from '../../hooks/useReveal'
import Eyebrow from '../ui/Eyebrow'
import Card from '../ui/Card'
import Metric from '../ui/Metric'
import Section from '../ui/Section'

const { context } = content

export default function LanguagesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <Section
      sectionRef={sectionRef}
      decoration={
        <div
          className="pointer-events-none absolute bottom-1/4 left-[6%] -z-[1] h-[32rem] w-[32rem] rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[130px]"
          aria-hidden="true"
        />
      }
    >
      <header className="flex flex-col items-center text-center">
        <Eyebrow className="reveal">{context.eyebrow}</Eyebrow>
        <h2 className="reveal font-display mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--color-text)] md:text-5xl">
          {context.title}
        </h2>
        <p className="reveal mt-4 text-lg text-[var(--color-text-muted)]">{context.subtitle}</p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {context.metrics.map((metric) => (
            <Metric key={metric.label} value={metric.value} label={metric.label} className="reveal" />
          ))}
        </div>

        <Card hoverable={false} className="reveal">
          <p className="font-mono text-[0.7rem] font-semibold tracking-[0.25em] text-[var(--color-accent)] uppercase">
            context engineering
          </p>
          {/* El bloque se centra (mx-auto + max-w); las líneas se alinean a la izquierda.
              `justify-center` por línea dejaba el margen izquierdo dentado. */}
          <ul className="mx-auto mt-5 max-w-md space-y-3.5 text-left">
            {context.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <span
                  className="glow-dot mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                  aria-hidden="true"
                />
                <span className="text-sm leading-relaxed text-[var(--color-text)] md:text-base">{rule}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  )
}
