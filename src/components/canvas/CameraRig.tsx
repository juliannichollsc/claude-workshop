import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { Vector3 } from 'three'
import { useSequence } from '../../hooks/useSequence'
import { SEQUENCE } from '../../config/sequence'

// Reutilizables entre frames para no crear basura de GC en useFrame.
const desiredPosition = new Vector3()
const desiredTarget = new Vector3()

function lerpVec3(from: readonly number[], to: readonly number[], t: number, out: Vector3) {
  out.set(
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  )
}

/** Cámara cinemática: sigue la secuencia de keyframes + un desplazamiento sutil por mouse. */
export default function CameraRig() {
  const { camera, pointer } = useThree()
  const targetRef = useRef(new Vector3(0, 0, 0))
  const seq = useSequence()

  useFrame((_, delta) => {
    const from = SEQUENCE[seq.from]
    const to = SEQUENCE[seq.to]

    lerpVec3(from.cameraPosition, to.cameraPosition, seq.t, desiredPosition)
    lerpVec3(from.cameraTarget, to.cameraTarget, seq.t, desiredTarget)

    // Desplazamiento sutil por posición del mouse.
    desiredPosition.x += pointer.x * 0.3
    desiredPosition.y += pointer.y * 0.2

    easing.damp3(camera.position, desiredPosition, 0.2, delta)
    easing.damp3(targetRef.current, desiredTarget, 0.2, delta)

    camera.lookAt(targetRef.current)
    camera.updateProjectionMatrix()
  })

  return null
}
