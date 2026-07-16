import { useRef } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { useSequence } from '../../hooks/useSequence'
import { SEQUENCE } from '../../config/sequence'

// Reutilizables entre frames (sin GC en useFrame).
const fromColor = new Color()
const toColor = new Color()
const emissive = new Color()

/**
 * Núcleo del agente — representación abstracta de Claude Code.
 * No es un modelo externo: es geometría procedural wireframe que late y rota
 * con el scroll, con emisividad reactiva al accentColor del keyframe activo.
 * "Claude no tiene cuerpo, tiene un loop."
 */
export default function Model() {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const shellRef = useRef<Mesh>(null)
  const scroll = useScroll()
  const seq = useSequence()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Color emisivo interpolado entre keyframes.
    fromColor.set(SEQUENCE[seq.from].accentColor)
    toColor.set(SEQUENCE[seq.to].accentColor)
    emissive.copy(fromColor).lerp(toColor, seq.t)

    // Prueba: en dark theme la figura va blanca; en light usa el accent del keyframe.
    if (document.documentElement.dataset.theme !== 'light') {
      emissive.set('#ffffff')
    }

    if (groupRef.current) {
      // Rotación ligada al progreso de scroll + deriva suave continua.
      groupRef.current.rotation.y = scroll.offset * Math.PI * 2 + t * 0.05
      groupRef.current.rotation.x = scroll.offset * Math.PI * 0.5
      // Pulso de "latido".
      const pulse = 1 + Math.sin(t * 1.5) * 0.04
      groupRef.current.scale.setScalar(pulse)
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as MeshStandardMaterial
      mat.emissive.copy(emissive)
      mat.color.copy(emissive)
      mat.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.3
    }
    if (shellRef.current) {
      const mat = shellRef.current.material as MeshStandardMaterial
      mat.emissive.copy(emissive)
      mat.color.copy(emissive)
      // La cáscara contrarota para dar sensación de "campo" alrededor del núcleo.
      shellRef.current.rotation.y = -t * 0.15
      shellRef.current.rotation.z = t * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Núcleo interno sólido-wireframe */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial wireframe emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* Cáscara exterior — campo del agente */}
      <mesh ref={shellRef} scale={1.6}>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshStandardMaterial
          wireframe
          transparent
          opacity={0.25}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
