import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, useProgress } from '@react-three/drei'
import Scene from './components/canvas/Scene'
import ToxicBackdrop from './components/canvas/ToxicBackdrop'
import ThemeToggle from './components/ui/ThemeToggle'
import HeroSection from './components/sections/HeroSection'
import SkillsSection from './components/sections/SkillsSection'
import FrameworksSection from './components/sections/FrameworksSection'
import LanguagesSection from './components/sections/LanguagesSection'
import ExtendSection from './components/sections/ExtendSection'
import ExperienceSection from './components/sections/ExperienceSection'
import FaqSection from './components/sections/FaqSection'
import { INITIAL_PAGES } from './config/sequence'

// Vive DENTRO del Canvas: useProgress lee el estado del loading manager de R3F.
// No renderiza nada en el DOM — solo reporta arriba vía onLoaded.
function LoadingReporter({ onLoaded }: { onLoaded: (loaded: boolean) => void }) {
  const { active, progress } = useProgress()
  useEffect(() => {
    if (!active && progress === 100) onLoaded(true)
  }, [active, progress, onLoaded])
  return null
}

// Overlay de carga SIN fondo opaco: deja ver el shader animado (que vive detrás,
// en -z-10) y solo superpone el texto. Se desvanece al terminar de cargar.
function LoadingOverlay({ loaded }: { loaded: boolean }) {
  return (
    <div
      className={clsx(
        'pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700',
        loaded ? 'opacity-0' : 'opacity-100',
      )}
      aria-hidden={loaded}
    >
      <p className="font-mono animate-pulse text-lg tracking-widest text-[var(--color-accent)]">
        Iniciando el núcleo…
      </p>
    </div>
  )
}

/**
 * Envuelve las secciones y reporta cuántos viewports mide el contenido de verdad.
 *
 * `pages` de ScrollControls es la altura del spacer, no el número de secciones: drei no mide
 * el contenido. Fijarlo a mano corta el scroll en cuanto una sección pasa de 100vh. Se reporta
 * en fracciones (p.ej. 7.4) para no dejar viewport vacío al final.
 */
function ScrollContent({ onPages, children }: { onPages: (pages: number) => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const viewport = window.innerHeight
      if (!viewport) return
      // Redondeo a 2 decimales: sin él, un scrollHeight subpíxel dispara setState en bucle.
      onPages(Math.max(1, Math.round((el.scrollHeight / viewport) * 100) / 100))
    }

    measure()
    // El contenido crece al cargar fuentes y al revelarse las cards — no basta medir una vez.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [onPages])

  return (
    <div ref={ref} className="relative z-10 w-full">
      {children}
    </div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [pages, setPages] = useState(INITIAL_PAGES)

  // Red de seguridad: si por lo que sea useProgress no reporta 100 (WebGL raro,
  // recursos que no suspenden), no dejamos el overlay colgado para siempre.
  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 2500)
    return () => clearTimeout(id)
  }, [])

  // Estable: ScrollContent lo tiene como dependencia de su efecto de medición.
  const handlePages = useCallback((next: number) => {
    setPages((prev) => (prev === next ? prev : next))
  }, [])

  return (
    <>
      <ThemeToggle />
      <LoadingOverlay loaded={loaded} />

      <Canvas
        className="fixed inset-0 h-screen w-screen"
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ScrollControls pages={pages} damping={0.25}>
          {/* Fondo tóxico — el "terminal vivo" de Claude Code. Fuera del Suspense para
              que se vea de inmediato durante la carga; vive en el MISMO contexto WebGL
              que la escena, así que el post-procesado ya no lo puede tapar. */}
          <ToxicBackdrop />

          {/* Suspense DEBE vivir dentro del Canvas: useGLTF/Environment suspenden
              en el reconciler de R3F, un Suspense de React fuera del Canvas no los captura. */}
          <Suspense fallback={null}>
            <Scene />
            <LoadingReporter onLoaded={setLoaded} />
          </Suspense>

          {/* El wrapper que drei genera para <Scroll html> es position:absolute; left:0
              SIN width → se encoge al contenido y todo queda pegado a la izquierda.
              style={{width:'100vw'}} lo fuerza al ancho del viewport (drei respeta ...style). */}
          <Scroll html style={{ width: '100vw' }}>
            <ScrollContent onPages={handlePages}>
              {/* El orden debe coincidir con SEQUENCE en config/sequence.ts. */}
              <HeroSection />
              <SkillsSection />
              <FrameworksSection />
              <LanguagesSection />
              <ExtendSection />
              <ExperienceSection />
              <FaqSection />
            </ScrollContent>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </>
  )
}
