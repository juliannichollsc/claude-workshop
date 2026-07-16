import clsx from 'clsx'
import type { ReactNode, RefObject } from 'react'

interface SectionProps {
  sectionRef: RefObject<HTMLElement | null>
  children: ReactNode
  /** Decoración (glow, scrim) posicionada absolute respecto a la sección. */
  decoration?: ReactNode
  /** Ancho máximo del contenedor centrado (clase Tailwind). */
  maxWidth?: string
}

/**
 * Shell de sección. El fondo 3D queda detrás (transparente); el contenido va encima.
 *
 * Centrado: la `<section>` toma el ancho del wrapper `position:absolute` que drei genera para
 * `<Scroll html>` (App le fija `width: 100vw`). Antes usaba `w-screen`, pero `100vw` incluye la
 * barra de scroll del contenedor y la sección sobresalía unos píxeles hacia la derecha.
 * El contenedor flex centra la columna `max-w-*` con `justify-center` (eje horizontal) +
 * `items-center` (eje vertical). Se abandonó `mx-auto` porque los auto-márgenes de bloque
 * no repartían el espacio sobrante dentro del árbol de drei; `justify-center` siempre centra.
 * El texto de toda la columna va centrado (`text-center`) salvo componentes que opten por
 * `text-left` (p.ej. Timeline, que es una secuencia con riel a la izquierda).
 */
export default function Section({ sectionRef, children, decoration, maxWidth = 'max-w-4xl' }: SectionProps) {
  return (
    <section ref={sectionRef} className="relative w-full">
      {decoration}
      <div className="flex min-h-screen w-full items-center justify-center px-6 py-24 md:px-12">
        <div className={clsx('w-full text-center', maxWidth)}>{children}</div>
      </div>
    </section>
  )
}
