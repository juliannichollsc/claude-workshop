import { useRef } from 'react'
import { content } from '../../data/cv'
import { useReveal } from '../../hooks/useReveal'
import Eyebrow from '../ui/Eyebrow'
import Card from '../ui/Card'
import Section from '../ui/Section'

const { capabilities } = content

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <Section
      sectionRef={sectionRef}
      decoration={
        <div
          className="pointer-events-none absolute top-1/3 left-[4%] -z-[1] h-[32rem] w-[32rem] rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[130px]"
          aria-hidden="true"
        />
      }
    >
      <header className="flex flex-col items-center text-center">
        <Eyebrow className="reveal">{capabilities.eyebrow}</Eyebrow>
        <h2 className="reveal font-display mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--color-text)] md:text-5xl">
          {capabilities.title}
        </h2>
        <p className="reveal mt-4 text-lg text-[var(--color-text-muted)]">{capabilities.subtitle}</p>
      </header>

      <div className="mt-12 grid items-start gap-6 md:grid-cols-2">
        {capabilities.groups.map((group) => (
          <Card key={group.label} className="reveal h-full">
            <p className="font-mono text-[0.7rem] font-semibold tracking-[0.25em] text-[var(--color-accent)] uppercase">
              {group.label}
            </p>
            <ul className="mt-4 space-y-4 text-left">
              {group.items.map((item) => (
                <li key={item.name}>
                  <p className="font-display font-semibold text-[var(--color-text)]">{item.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.desc}</p>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  )
}
