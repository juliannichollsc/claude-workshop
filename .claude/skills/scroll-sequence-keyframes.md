---
name: scroll-sequence-keyframes
description: |
  Patrón de producción para dirigir cámara, iluminación y énfasis visual
  mediante los SequenceKeyframe de src/config/sequence.ts, interpolados por
  el progreso de scroll. Cubre damping cinemático de cámara con maath,
  iluminación de tres puntos reactiva al accentColor del keyframe activo,
  bloom como cue de atención, y teoría del color para jerarquía visual.
  Use this skill when se necesita mover la cámara, cambiar la iluminación
  o el bloom en sincronía con el scroll, o decidir qué componente debe
  "resaltar" en cada sección de la experiencia inmersiva.
---

# Scroll Sequence Keyframes — cámara, luz y color dirigidos por scroll

## El contrato

`SequenceKeyframe` (src/types/sequence.ts) ya define, por sección: `cameraPosition`, `cameraTarget`, `modelRotation`, `modelPosition`, `bloomIntensity`, `accentColor`. `useSequence()` debe devolver `{ progress, from, to, t }` — el keyframe activo se interpola entre `SEQUENCE[from]` y `SEQUENCE[to]` según `t` (0..1).

**Esto vive enteramente en `useFrame`. Nunca en `setState`.** Cada campo del keyframe interpolado se aplica como mutación directa a refs (cámara, luces, uniforms del efecto de bloom).

## Cámara cinemática — damp3, no lerp

`lerp` puro se ve entrecortado a distintos framerates y no es interrumpible a mitad de transición. Usa `easing.damp3` de `maath` para posición y target de cámara:

```tsx
import { easing } from 'maath'

useFrame((state, delta) => {
  const kf = getInterpolatedKeyframe(sequenceState) // lerp manual de los campos numéricos del keyframe
  easing.damp3(camera.position, kf.cameraPosition, 0.2, delta)
  easing.damp3(lookAtTarget.current, kf.cameraTarget, 0.2, delta)
  camera.lookAt(lookAtTarget.current)
  camera.updateProjectionMatrix()
})
```

- `smoothTime` (el 3er argumento, aquí `0.2`) es aproximadamente cuántos segundos tarda en alcanzar el objetivo — no una fracción arbitraria como en `lerp`. Es *refresh-rate independent*: se ve igual a 60fps y a 144fps.
- Nunca animes `cameraPosition`/`cameraTarget` con GSAP — son objetos Three.js, GSAP es exclusivo del DOM (regla dura del proyecto).
- `updateProjectionMatrix()` es obligatorio si además cambias `fov` por keyframe (ej. acercar el FOV en la sección de énfasis).

## Iluminación de tres puntos reactiva al keyframe

Estructura base en `Lighting.tsx`:
- **Key light** (`directionalLight`): la luz principal, intensidad alta, con sombras.
- **Fill light** (`ambientLight` o `hemisphereLight`): suaviza sombras, intensidad baja (~0.5) para no lavar el bloom.
- **Rim light** (`pointLight`): separa el modelo del fondo, `decay={2}` (físicamente correcto).

El **color** de key/rim light debe seguir el `accentColor` del keyframe activo (interpolado con `THREE.Color.lerp`, no con CSS):

```tsx
useFrame(() => {
  const kf = getInterpolatedKeyframe(sequenceState)
  keyLightRef.current.color.set(kf.accentColor)
  rimLightRef.current.color.set(kf.accentColor)
})
```

Temperatura como herramienta narrativa: acentos fríos (cyan, ~5000K+, ej. `#22d3ee`) para secciones de "capacidad técnica/precisión"; acentos cálidos o violeta-saturado para secciones de "impacto/cierre". El proyecto ya usa esta dualidad cyan/violeta en `SEQUENCE` — mantenerla es consistente con la temática cyberpunk.

## Bloom como cue de atención, no decoración

`@react-three/postprocessing`:

```tsx
<EffectComposer>
  <Bloom
    intensity={kf.bloomIntensity}
    luminanceThreshold={0.9}
    luminanceSmoothing={0.3}
  />
</EffectComposer>
```

- `luminanceThreshold: 0.9` con `luminanceSmoothing: 0.3` da un glow selectivo (solo lo realmente brillante/emissive) sin lavar toda la escena — evita el error más común de bloom en R3F.
- `bloomIntensity` del keyframe activo **sube cuando esa sección quiere dirigir la mirada al modelo** (ej. sección de Modelos/Frameworks) y **baja en secciones de lectura densa** (ej. Fases del Workshop, donde el texto debe ganar contraste sobre el canvas).
- Renderizar el bloom a media resolución si hay jank — casi duplica el framerate sin pérdida perceptible.

## GSAP ScrollTrigger dentro de `<Scroll html>` — el scroller no es window

`<Scroll html>` de drei renderiza las secciones sobre un **scroll virtual** (un `<div>` con scroll nativo oculto que `ScrollControls` sincroniza con el drag/wheel), no sobre `window`. Si un `ScrollTrigger` se crea sin decírselo, escucha `window` y **nunca dispara** — el síntoma es "las animaciones de entrada simplemente no pasan nada".

```tsx
import { useScroll } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function MiSeccion() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scroll = useScroll() // de @react-three/drei

  useGSAP(() => {
    gsap.from('.animate-item', {
      y: 60,
      opacity: 0,
      stagger: 0.1,
      scrollTrigger: {
        trigger: containerRef.current,
        scroller: scroll.el, // <- el contenedor real del scroll virtual de ScrollControls
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })
  }, { scope: containerRef })

  return <section ref={containerRef} className="h-screen">{/* ... */}</section>
}
```

- `scroll.el` es el `<div>` con el scroll real que expone `useScroll()` — pásalo siempre a `scrollTrigger.scroller` en cualquier sección dentro de `<Scroll html>`.
- `toggleActions: 'play none none reverse'` para play/reverse discreto — no lo mezcles con `scrub` (son dos modos de uso distintos de ScrollTrigger, mezclarlos da comportamiento errático).

## Teoría del color aplicada — saturación dirige la atención, no la estética

Regla operativa (no es gusto, es jerarquía funcional):
- El ojo humano va primero a lo saturado. **De-satura el contexto, satura solo lo que importa en ese momento del scroll.**
- Mientras un keyframe tiene `bloomIntensity` alto (el modelo/canvas es el foco), las cards de esa sección deben usar acentos **menos saturados** (`text-slate-300`, bordes `border-slate-700/50`) para no competir con el 3D.
- Mientras `bloomIntensity` es bajo (la sección es de lectura — ej. Fases del Workshop), el acento de las cards puede subir de saturación (`text-cyan-400`, `border-cyan-400/40`) porque ahí el contenido HTML es el foco.
- Nunca subas saturación en más de un elemento a la vez por sección — si todo grita, nada resalta.

## Errores a evitar

- Interpolar `accentColor` como string CSS con lerp de texto — siempre pasa por `THREE.Color`.
- Mover la cámara con `lerp` a mano cuando ya existe `damp3` — el jank es notorio en scroll rápido.
- Subir `bloomIntensity` y saturación de UI al mismo tiempo — compiten por atención en vez de guiarla.
- Aplicar el `accentColor` a la luz pero no al bloom (o viceversa) — deben moverse juntos, son la misma señal narrativa.
