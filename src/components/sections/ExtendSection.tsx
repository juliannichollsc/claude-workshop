import { useRef } from 'react'
import { content } from '../../data/cv'
import { useReveal } from '../../hooks/useReveal'
import Eyebrow from '../ui/Eyebrow'
import Card from '../ui/Card'
import Section from '../ui/Section'

const { extend } = content

export default function ExtendSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <Section
      sectionRef={sectionRef}
      decoration={
        <div
          className="pointer-events-none absolute top-1/3 right-[5%] -z-[1] h-[32rem] w-[32rem] rounded-full bg-[var(--color-accent-secondary)] opacity-[0.06] blur-[130px]"
          aria-hidden="true"
        />
      }
    >
      <header className="flex flex-col items-center text-center">
        <Eyebrow variant="accent-secondary" className="reveal">
          {extend.eyebrow}
        </Eyebrow>
        <h2 className="reveal font-display mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--color-text)] md:text-5xl">
          {extend.title}
        </h2>
        <p className="reveal mt-4 text-lg text-[var(--color-text-muted)]">{extend.subtitle}</p>
      </header>

      <div className="mt-12 grid items-start gap-6 md:grid-cols-2">
        {extend.items.map((item) => (
          <Card key={item.name} className="reveal h-full">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-text)]">
                {item.name}
              </h3>
              <span className="font-mono rounded-md border border-[var(--color-border)] px-2 py-1 text-[0.68rem] tracking-wide text-[var(--color-accent-secondary)]">
                {item.hint}
              </span>
            </div>
            <p className="mt-3 text-left text-sm leading-relaxed text-[var(--color-text-muted)]">{item.desc}</p>
          </Card>
        ))}
      </div>

      <p className="reveal mt-8 flex items-start justify-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span className="mt-0.5 text-[var(--color-accent-secondary)]">◆</span>
        <span>{extend.caption}</span>
      </p>
    </Section>
  )
}
