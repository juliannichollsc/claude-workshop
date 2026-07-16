import { useScroll } from '@react-three/drei'

/** Progreso global del scroll, 0..1. Debe usarse dentro de <ScrollControls>. */
export function useScrollProgress(): number {
  const scroll = useScroll()
  return scroll.offset
}
