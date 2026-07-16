import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { Color } from 'three'
import type { PointLight } from 'three'
import { useSequence } from '../../hooks/useSequence'
import { SEQUENCE } from '../../config/sequence'

// Reutilizables entre frames para no crear basura de GC en useFrame.
const fromColor = new Color()
const toColor = new Color()

/**
 * Iluminación de 3 puntos. El rim light sigue el accentColor del keyframe activo.
 * Sin <Environment> a propósito: elimina la dependencia de un HDRI externo (CDN)
 * que podría colgar la carga; el núcleo es wireframe emisivo y no necesita IBL.
 */
export default function Lighting() {
  const rimRef = useRef<PointLight>(null)
  const seq = useSequence()

  useFrame(() => {
    if (!rimRef.current) return
    fromColor.set(SEQUENCE[seq.from].accentColor)
    toColor.set(SEQUENCE[seq.to].accentColor)
    rimRef.current.color.set(fromColor).lerp(toColor, seq.t)
  })

  return (
    <>
      {/* Key light */}
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      {/* Fill light */}
      <ambientLight intensity={0.4} />
      {/* Rim light — color reactivo al keyframe activo */}
      <pointLight ref={rimRef} position={[-3, 1.5, -3]} intensity={5} decay={2} />

      <ContactShadows position={[0, -1.8, 0]} opacity={0.35} scale={12} blur={2.6} far={4} />
    </>
  )
}
