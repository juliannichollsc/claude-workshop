import { useEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'

/**
 * Revela `.reveal` (sube) y `.timeline-step` (entra por la izquierda) al entrar la sección
 * en viewport.
 *
 * Deliberadamente NO usa ScrollTrigger: `<Scroll html>` de drei no scrollea el contenido,
 * lo mantiene fijo y le aplica un translate3d al wrapper. ScrollTrigger cruza rects del DOM
 * con el scrollTop del scroller, y con el contenido transformado esas dos medidas se
 * contradicen — los triggers no disparaban y las cards se quedaban en autoAlpha:0 para
 * siempre. IntersectionObserver mide contra el viewport y sí respeta los transforms.
 */
export function useReveal(sectionRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = sectionRef.current
    if (!root) return
    // Sin animación: el contenido ya está visible por defecto, no hay nada que sembrar.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const reveal = root.querySelectorAll('.reveal')
    const steps = root.querySelectorAll('.timeline-step')

    const ctx = gsap.context(() => {
      gsap.set(reveal, { autoAlpha: 0, y: 42 })
      gsap.set(steps, { autoAlpha: 0, x: -32 })
    }, root)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect() // Una sola vez: sin reverse al salir de pantalla.
        ctx.add(() => {
          gsap.to(reveal, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09 })
          gsap.to(steps, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12 })
        })
      },
      { threshold: 0.15 },
    )
    observer.observe(root)

    return () => {
      observer.disconnect()
      ctx.revert() // Quita los estilos inline que sembró gsap.set.
    }
  }, [sectionRef])
}
