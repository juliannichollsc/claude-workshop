import { useRef } from 'react'
import { content } from '../../data/cv'
import { useReveal } from '../../hooks/useReveal'
import Eyebrow from '../ui/Eyebrow'
import Card from '../ui/Card'
import Section from '../ui/Section'

const { faq, links } = content

export default function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <Section
      sectionRef={sectionRef}
      maxWidth="max-w-3xl"
      decoration={
        <div
          className="pointer-events-none absolute bottom-1/4 left-[6%] -z-[1] h-[34rem] w-[34rem] rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[130px]"
          aria-hidden="true"
        />
      }
    >
      <header className="flex flex-col items-center text-center">
        <Eyebrow className="reveal">{faq.eyebrow}</Eyebrow>
        <h2 className="reveal font-display mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--color-text)] md:text-5xl">
          {faq.title}
        </h2>
        <p className="reveal mt-4 text-lg text-[var(--color-text-muted)]">{faq.subtitle}</p>
      </header>

      <div className="mt-12 flex flex-col gap-5">
        {faq.items.map((item) => (
          <Card key={item.q} className="reveal">
            <h3 className="font-display text-lg font-bold tracking-tight text-[var(--color-text)] md:text-xl">
              {item.q}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
              {item.a}
            </p>
          </Card>
        ))}
      </div>

      <a
        href={links.docs}
        target="_blank"
        rel="noreferrer"
        className="reveal font-mono mt-10 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-5 py-2.5 text-xs tracking-[0.18em] text-[var(--color-accent)] uppercase backdrop-blur-xl transition hover:border-[var(--color-accent)] hover:-translate-y-0.5"
      >
        Leer la documentación
        <span aria-hidden="true">→</span>
      </a>
    </Section>
  )
}
