import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to('.scroll-indicator-chevron', {
        y: 10,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    },
    { scope: ref },
  )

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--color-text-muted)]"
      aria-hidden="true"
    >
      <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
      <svg
        className="scroll-indicator-chevron h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
