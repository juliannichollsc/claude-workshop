import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { GLSL3, Vector2, Vector4 } from 'three'
import type { ShaderMaterial } from 'three'
import { presets, PatternShapes, hexToRgba, FRAGMENT_SHADER, THEME_PRESET } from './AnimatedBackground'
import { useTheme } from '../../hooks/useTheme'

// Toxic y Solar comparten geometría: los uniforms no-cromáticos se fijan una vez desde
// aquí y el switch de tema solo interpola u_color1..3.
const P = presets.Toxic

/** Segundos que tarda el fondo en llegar al color del tema nuevo. */
const FADE_SECONDS = 0.7

const VERTEX_SHADER = `precision highp float;
in vec3 position;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

// RawShaderMaterial + glslVersion=GLSL3 hace que three prependa "#version 300 es";
// hay que quitarlo del fuente para no duplicarlo.
const FRAG = FRAGMENT_SHADER.replace('#version 300 es\n', '')

/**
 * Fondo tóxico como plano fullscreen DENTRO del canvas 3D (mismo contexto WebGL).
 * Los vértices se emiten en clip-space, así que ignora la cámara y siempre cubre el
 * viewport, detrás del modelo (renderOrder -1, sin depth). Sustituye al canvas WebGL
 * aparte, cuyo contexto se perdía al arrancar el post-procesado y dejaba el fondo en negro.
 */
export default function ToxicBackdrop() {
  const matRef = useRef<ShaderMaterial>(null)
  const theme = useTheme()

  // Colores destino del tema actual. Cambian con `theme`; useFrame los persigue por lerp.
  const targets = useMemo(() => {
    const p = presets[THEME_PRESET[theme]]
    return [
      new Vector4(...hexToRgba(p.color1)),
      new Vector4(...hexToRgba(p.color2)),
      new Vector4(...hexToRgba(p.color3)),
    ]
  }, [theme])

  // Sin deps: los uniforms se crean una sola vez y luego se mutan. Arrancan ya en el color
  // del tema activo (initTheme corre antes del render) para no fundir desde el verde.
  const uniforms = useMemo(() => {
    return {
      u_time: { value: 0 },
      u_resolution: { value: new Vector2() },
      u_pixelRatio: { value: 1 },
      u_scale: { value: P.scale },
      u_rotation: { value: (P.rotation * Math.PI) / 180 },
      u_color1: { value: targets[0].clone() },
      u_color2: { value: targets[1].clone() },
      u_color3: { value: targets[2].clone() },
      u_proportion: { value: P.proportion / 100 },
      u_softness: { value: P.softness / 100 },
      u_shape: { value: PatternShapes[P.shape] },
      u_shapeScale: { value: P.shapeSize / 100 },
      u_distortion: { value: P.distortion / 50 },
      u_swirl: { value: P.swirl / 100 },
      u_swirlIterations: { value: P.swirl === 0 ? 0 : P.swirlIterations },
    }
  }, [])

  // Mutación directa de uniforms — nunca setState en useFrame (regla de performance).
  useFrame((state, delta) => {
    const m = matRef.current
    if (!m) return
    const dpr = state.gl.getPixelRatio()
    const spd = (P.speed / 100) * 5
    m.uniforms.u_time.value = state.clock.elapsedTime * spd + P.offset * 0.01
    m.uniforms.u_resolution.value.set(state.size.width * dpr, state.size.height * dpr)
    m.uniforms.u_pixelRatio.value = dpr

    // Damping exponencial: el fondo alcanza el color del tema en ~FADE_SECONDS sea cual sea
    // el framerate. `delta` se acota porque una pestaña en background lo devuelve enorme.
    const t = 1 - Math.exp((-Math.min(delta, 0.1) * 5) / FADE_SECONDS)
    m.uniforms.u_color1.value.lerp(targets[0], t)
    m.uniforms.u_color2.value.lerp(targets[1], t)
    m.uniforms.u_color3.value.lerp(targets[2], t)
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <rawShaderMaterial
        ref={matRef}
        glslVersion={GLSL3}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
