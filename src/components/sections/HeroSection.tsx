import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useScroll } from '@react-three/drei'
import { content } from '../../data/cv'
import Eyebrow from '../ui/Eyebrow'
import ScrollIndicator from '../ui/ScrollIndicator'
import Section from '../ui/Section'

const { hero } = content

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { el } = useScroll()

  useGSAP(
    () => {
      const root = sectionRef.current
      if (!root) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-eyebrow', { y: 20, autoAlpha: 0, duration: 0.7 })
        .from('.hero-name', { yPercent: 30, autoAlpha: 0, duration: 1 }, '-=0.35')
        .from('.hero-subtitle', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-tagline', { y: 20, autoAlpha: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-meta > *', { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
    },
    { scope: sectionRef, dependencies: [el] },
  )

  return (
    <Section
      sectionRef={sectionRef}
      maxWidth="max-w-3xl"
      decoration={
        <>
          <div className="text-scrim absolute inset-0 -z-[1]" aria-hidden="true" />
          <div
            className="pointer-events-none absolute top-1/4 right-[6%] -z-[1] h-[36rem] w-[36rem] rounded-full bg-[var(--color-accent)] opacity-[0.07] blur-[130px]"
            aria-hidden="true"
          />
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <Eyebrow className="hero-eyebrow">{hero.eyebrow}</Eyebrow>

        <h1 className="hero-name font-display mt-6 text-6xl leading-[0.95] font-bold tracking-tight md:text-8xl">
          <span className="gradient-text glow-text">{hero.name}</span>
        </h1>

        <p className="hero-subtitle font-display mt-5 text-xl font-medium text-[var(--color-text)] md:text-2xl">
          {hero.subtitle}
        </p>

        <p className="hero-tagline mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
          {hero.tagline}
        </p>

        <div className="hero-meta mt-8 flex flex-wrap justify-center gap-2.5">
          {hero.meta.map((item) => (
            <span
              key={item}
              className="font-mono rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[0.68rem] tracking-[0.12em] text-[var(--color-text-muted)] backdrop-blur-xl"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <ScrollIndicator />
    </Section>
  )
}
