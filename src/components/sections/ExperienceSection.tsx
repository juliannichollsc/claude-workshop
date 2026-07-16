import { useRef } from 'react'
import { content } from '../../data/cv'
import { useReveal } from '../../hooks/useReveal'
import Eyebrow from '../ui/Eyebrow'
import Timeline from '../ui/Timeline'
import Section from '../ui/Section'

const { howItWorks } = content

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <Section
      sectionRef={sectionRef}
      maxWidth="max-w-3xl"
      decoration={
        <div
          className="pointer-events-none absolute top-1/4 right-[8%] -z-[1] h-[34rem] w-[34rem] rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[130px]"
          aria-hidden="true"
        />
      }
    >
      <header className="flex flex-col items-center text-center">
        <Eyebrow className="reveal">{howItWorks.eyebrow}</Eyebrow>
        <h2 className="reveal font-display mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--color-text)] md:text-5xl">
          {howItWorks.title}
        </h2>
        <p className="reveal mt-4 text-lg text-[var(--color-text-muted)]">{howItWorks.subtitle}</p>
      </header>

      <div className="mt-12">
        <Timeline steps={howItWorks.steps} />
      </div>

      <p className="reveal mt-8 flex items-start justify-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span className="mt-0.5 text-lg leading-none text-[var(--color-accent)]">↻</span>
        <span>{howItWorks.caption}</span>
      </p>
    </Section>
  )
}
