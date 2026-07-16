# ANIMACIÓN 3D — Especificación de la escena (resultado validado)

> Este documento congela **cómo se construyó la animación**: el fondo shader reactivo al tema, el núcleo wireframe que late y rota con el scroll, la cámara cinemática entre keyframes y el bloom reactivo. Es la referencia que la **FASE 1** de `PROMPT-2-CONSTRUIR-SPA.md` debe reproducir.
>
> Punto clave de arquitectura: **la capa 3D lee su estado SOLO de `src/config/sequence.ts`**. No depende del contenido de las secciones HTML. Por eso se puede rediseñar todo el HTML/UX sin rozar la animación. La animación es el **fondo ambiental**; el contenido va encima.

---

## 1. Vista de conjunto

```
<Canvas gl={{ alpha:true }} style={{background:'transparent'}}>   ← fija, fullscreen
  <ScrollControls pages={pages} damping={0.25}>                   ← `pages` se MIDE, no se fija
    <ToxicBackdrop/>                                              ← fondo shader, MISMO contexto WebGL
    <Suspense>                                                     ← DENTRO del Canvas
      <Scene>
        <Lighting/>    3 puntos, rim reactivo al accent
        <CameraRig/>   maath damp3 entre keyframes + mouse
        <Model/>       icosaedro wireframe núcleo + cáscara, late y rota
        <PostFX/>      Bloom, intensidad reactiva
      </Scene>
    </Suspense>
    <Scroll html style={{width:'100vw'}}>
      <ScrollContent onPages={…}> … 7 secciones … </ScrollContent>
    </Scroll>
  </ScrollControls>
</Canvas>
```

Motor de animación 3D: **`useFrame` de R3F, exclusivamente**. Nunca GSAP sobre objetos Three.js.

### Tres decisiones que se pagaron caras

Se documentan porque cada una costó una sesión de depuración:

1. **El fondo shader vive DENTRO del `<Canvas>`, no en un `<canvas>` aparte.** La versión original montaba `AnimatedBackground` como capa fija `-z-10` con su propio contexto WebGL2. Al arrancar el post-procesado, ese segundo contexto se perdía y el fondo quedaba en negro. `ToxicBackdrop` es el mismo shader dibujado como plano fullscreen en clip-space, en el contexto de R3F, con `renderOrder={-1}` y sin depth.

2. **`pages` de `ScrollControls` NO es el número de secciones.** Es la altura del spacer en múltiplos del viewport, y drei no mide el contenido. Las secciones son `min-h-screen`, así que las densas (timeline, FAQ) pasan de 100vh y el DOM acaba midiendo más que `SEQUENCE.length` viewports: el scroll se corta en la última sección. Hay que medir el contenido real y pasar el valor (en fracciones) a `pages`.

3. **ScrollTrigger de GSAP no funciona contra el scroller de drei.** `<Scroll html>` no scrollea el contenido: lo deja quieto y le aplica `transform: translate3d(...)` al wrapper. ScrollTrigger cruza rects del DOM con el `scrollTop` del scroller y esas dos medidas se contradicen — los triggers no disparan y las cards se quedan en `autoAlpha: 0` para siempre. El reveal del DOM usa `IntersectionObserver`, que mide contra el viewport y sí respeta los transforms (ver §10).

---

## 2. El guion de la escena — `src/config/sequence.ts`

El corazón de la animación. Un keyframe por sección (**7**). Cada consumidor (`Model`, `CameraRig`, `PostFX`, `Lighting`) interpola entre `SEQUENCE[from]` y `SEQUENCE[to]` con el progreso local `t`.

Una vuelta completa (2π) repartida entre los 7 keyframes: cada sección avanza π/3.

```ts
import type { SequenceKeyframe } from '../types/sequence'

// Paleta "Toxic": #050d05 / #0a240a / #39ff14
export const SEQUENCE: SequenceKeyframe[] = [
  { id: 'hero',        cameraPosition: [0, 0, 5],    cameraTarget: [0, 0, 0], modelRotation: [0, 0, 0],                 modelPosition: [0, -1, 0],   bloomIntensity: 0.6, accentColor: '#39ff14' },
  { id: 'skills',      cameraPosition: [2, 0.5, 4],  cameraTarget: [0, 0, 0], modelRotation: [Math.PI / 3, 0, 0],       modelPosition: [0, -1, 0],   bloomIntensity: 0.9, accentColor: '#39ff14' },
  { id: 'frameworks',  cameraPosition: [-2, 0.5, 4], cameraTarget: [0, 0, 0], modelRotation: [(Math.PI * 2) / 3, 0, 0], modelPosition: [0, -1, 0],   bloomIntensity: 1.2, accentColor: '#7cff3d' },
  { id: 'languages',   cameraPosition: [0, 1.5, 3.5],cameraTarget: [0, 0, 0], modelRotation: [Math.PI, 0, 0],           modelPosition: [0, -0.8, 0], bloomIntensity: 0.9, accentColor: '#7cff3d' },
  { id: 'extend',      cameraPosition: [2.2, 1, 4],  cameraTarget: [0, 0, 0], modelRotation: [(Math.PI * 4) / 3, 0, 0], modelPosition: [0, -0.9, 0], bloomIntensity: 1.1, accentColor: '#7cff3d' },
  { id: 'experience',  cameraPosition: [0, 0, 6],    cameraTarget: [0, 0, 0], modelRotation: [(Math.PI * 5) / 3, 0, 0], modelPosition: [0, -1, 0],   bloomIntensity: 0.8, accentColor: '#39ff14' },
  { id: 'faq',         cameraPosition: [0, -0.5, 5], cameraTarget: [0, 0, 0], modelRotation: [Math.PI * 2, 0, 0],       modelPosition: [0, -1, 0],   bloomIntensity: 0.6, accentColor: '#39ff14' },
]

/** Valor inicial de `pages` antes de medir el contenido real. Ver §9. */
export const INITIAL_PAGES = SEQUENCE.length
```

> **El orden de `SEQUENCE` debe coincidir con el orden de las secciones en `App.tsx`.** `useSequence` interpola por índice, no por `id`.

Tipos en `src/types/sequence.ts`: `SequenceKeyframe` (`id`, `cameraPosition`, `cameraTarget`, `modelRotation`, `modelPosition`, `bloomIntensity`, `accentColor`) y `SequenceState` (`progress`, `from`, `to`, `t`).

---

## 3. Hooks de scroll → keyframe

`useScrollProgress()` devuelve `useScroll().offset` (0..1). Es independiente de `pages`, así que medir el spacer no descoloca la secuencia.

```ts
export function useSequence(): SequenceState {
  const progress = useScrollProgress()
  const lastIndex = SEQUENCE.length - 1
  const clamped = Math.min(Math.max(progress, 0), 1)
  const scaled = clamped * lastIndex
  const from = Math.min(Math.floor(scaled), Math.max(lastIndex - 1, 0))
  const to = Math.min(from + 1, lastIndex)
  return { progress: clamped, from, to, t: scaled - from }
}
```

> **Limitación conocida.** Reparte los keyframes uniformemente sobre el progreso, o sea que asume secciones de igual altura. Como las secciones crecen con su contenido, la rotación del modelo se desincroniza levemente de las secciones. Anclar cada keyframe al `offsetTop` de su `<section>` lo resolvería.

---

## 4. El núcleo — `src/components/canvas/Model.tsx`

Geometría procedural, **sin `.glb` externo**. Un icosaedro wireframe (núcleo) + una cáscara mayor semitransparente que contrarrota. Late con el tiempo, rota con el scroll, emisividad reactiva al `accentColor`.

```tsx
const fromColor = new Color()   // reutilizables: sin GC por frame
const toColor = new Color()
const emissive = new Color()

useFrame((state) => {
  const t = state.clock.elapsedTime
  fromColor.set(SEQUENCE[seq.from].accentColor)
  toColor.set(SEQUENCE[seq.to].accentColor)
  emissive.copy(fromColor).lerp(toColor, seq.t)

  groupRef.current.rotation.y = scroll.offset * Math.PI * 2 + t * 0.05
  groupRef.current.rotation.x = scroll.offset * Math.PI * 0.5
  groupRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04)   // pulso

  const mat = coreRef.current.material as MeshStandardMaterial
  mat.emissive.copy(emissive)
  mat.color.copy(emissive)
  mat.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.3
  // la cáscara contrarrota: rotation.y = -t * 0.15, rotation.z = t * 0.1
})
```

```tsx
<group ref={groupRef}>
  <mesh ref={coreRef}>
    <icosahedronGeometry args={[1.1, 1]} />
    <meshStandardMaterial wireframe emissiveIntensity={1.4} toneMapped={false} />
  </mesh>
  <mesh ref={shellRef} scale={1.6}>
    <icosahedronGeometry args={[1.1, 2]} />
    <meshStandardMaterial wireframe transparent opacity={0.25} emissiveIntensity={0.8} toneMapped={false} />
  </mesh>
</group>
```

Reglas duras: `useFrame` **nunca** llama `setState`; los `Color` viven fuera del componente; `toneMapped={false}` para que el emisivo entre fuerte al bloom.

> La geometría procedural es la opción **por defecto y recomendada**: cuesta 0 KB de bundle y 0 requests. Si quieres otra cosa, ver §12.

---

## 5. Cámara — `CameraRig.tsx`

Interpola `cameraPosition`/`cameraTarget` del keyframe, suaviza con `easing.damp3` de maath (`0.2` de smooth), y añade un desplazamiento por mouse (`pointer.x * 0.3`, `pointer.y * 0.2`). `camera.lookAt(target)` + `updateProjectionMatrix()` cada frame. Devuelve `null`.

## 6. Luz — `Lighting.tsx`

`directionalLight` (3,5,2 · 1.2) + `ambientLight` (0.4) + `pointLight` rim que sigue el `accentColor` interpolado (−3, 1.5, −3 · intensity 5 · decay 2) + `ContactShadows`. **Sin `<Environment>`** a propósito: elimina la dependencia de un HDRI por CDN que podría colgar la carga; el núcleo es emisivo y no necesita IBL.

## 7. Post-proceso — `PostFX.tsx`

`<EffectComposer><Bloom luminanceThreshold={0.9} luminanceSmoothing={0.3} intensity={interpolado} /></EffectComposer>`. El bloom sobre el wireframe emisivo es el 80% de la sensación inmersiva.

`Scene.tsx` solo compone: `<Lighting/> <CameraRig/> <Model/> <PostFX/>`.

---

## 8. Fondo shader — `AnimatedBackground.tsx` + `ToxicBackdrop.tsx`

`AnimatedBackground.tsx` es la **fuente**: presets, `FRAGMENT_SHADER`, `PatternShapes`, `hexToRgba` y `THEME_PRESET`. Su componente por defecto (canvas WebGL2 independiente) **ya no se monta** — quedó como referencia y fallback.

`ToxicBackdrop.tsx` es lo que se renderiza: el mismo fragment shader sobre un `planeGeometry [2,2]` con `rawShaderMaterial` (`glslVersion={GLSL3}`), vértices emitidos en clip-space —así ignora la cámara y siempre cubre el viewport—, `renderOrder={-1}`, `depthTest={false}`, `depthWrite={false}`, `toneMapped={false}`.

**Es reactivo al tema.** Dos presets con **geometría idéntica** y solo colores distintos, para que el switch sea un cross-fade limpio y no una deformación del patrón:

```ts
Toxic: { color1: '#050d05', color2: '#0a240a', color3: '#39ff14', /* dark  */ }
Solar: { color1: '#fdf6ec', color2: '#fcd9a6', color3: '#ea580c', /* light */ }
// resto de params idénticos: rotation -90, proportion 55, scale 0.5, speed 25,
// distortion 60, swirl 100, swirlIterations 15, softness 70, offset -100, shape 'Edge', shapeSize 20

export const THEME_PRESET = { dark: 'Toxic', light: 'Solar' } as const
```

`useFrame` persigue los colores destino con damping exponencial (~0.7 s, independiente del framerate). `delta` se acota (`Math.min(delta, 0.1)`) porque una pestaña en background lo devuelve enorme y produciría un salto seco:

```ts
const t = 1 - Math.exp((-Math.min(delta, 0.1) * 5) / FADE_SECONDS)
m.uniforms.u_color1.value.lerp(targets[0], t)   // idem color2, color3
```

Los uniforms se crean **una sola vez** (`useMemo` sin deps) sembrados ya con el color del tema activo — `initTheme()` corre en `main.tsx` antes del primer render, así que el fondo no nace verde y salta.

---

## 9. Montaje — `src/App.tsx`

```tsx
<ThemeToggle />                       {/* fixed top-right, fuera del Canvas */}
<LoadingOverlay loaded={loaded} />    {/* sin fondo opaco: deja ver el shader */}

<Canvas className="fixed inset-0 h-screen w-screen"
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true }} style={{ background: 'transparent' }}>
  <ScrollControls pages={pages} damping={0.25}>
    <ToxicBackdrop />                 {/* fuera del Suspense: visible durante la carga */}
    <Suspense fallback={null}>        {/* DENTRO del Canvas — crítico */}
      <Scene />
      <LoadingReporter onLoaded={setLoaded} />
    </Suspense>
    <Scroll html style={{ width: '100vw' }}>
      <ScrollContent onPages={handlePages}>{/* 7 secciones */}</ScrollContent>
    </Scroll>
  </ScrollControls>
</Canvas>
```

- **`<Suspense>` DENTRO del `<Canvas>`**, nunca envolviéndolo: `useGLTF`/`Environment`/texturas suspenden en el reconciler de R3F.
- **`style={{ width: '100vw' }}` en `<Scroll html>`**: el wrapper que genera drei es `position:absolute; left:0` **sin width**, así que se encoge al contenido y todo queda pegado a la izquierda.
- **`ScrollContent` mide y reporta `pages`.** `ResizeObserver` sobre el contenido, `scrollHeight / innerHeight`, redondeado a 2 decimales (sin eso, un subpíxel dispara `setState` en bucle) y en fracciones para no dejar viewport vacío.
- **Sin `<StrictMode>`**: en dev, React 19 monta dos veces y `<Scroll html>` llama `createRoot()` sobre el mismo contenedor.
- Overlay de carga con `useProgress()` de drei + red de seguridad `setTimeout(…, 2500)`.

---

## 10. Reveal del DOM — `src/hooks/useReveal.ts`

**No usa ScrollTrigger** (ver §1, decisión 3). Siembra el estado inicial con `gsap.set` dentro de un `gsap.context`, y un `IntersectionObserver` (`threshold: 0.15`) dispara los tweens **una sola vez** por sección — sin el `reverse` que dejaba elementos pegados en estado invisible.

```ts
gsap.set('.reveal', { autoAlpha: 0, y: 42 })
gsap.set('.timeline-step', { autoAlpha: 0, x: -32 })
// al intersectar: observer.disconnect() y gsap.to(...) con stagger
// cleanup: observer.disconnect() + ctx.revert()
```

Si `prefers-reduced-motion` está activo, el hook sale antes de sembrar nada: el contenido ya es visible por defecto.

---

## 11. Alternativas opcionales al núcleo procedural

> **Ninguna está activa, y el default no debería cambiar sin una razón.** El bundle ya pesa ~1.3 MB (371 KB gzip) y `three` es la mayor parte. Cada opción de abajo suma encima de eso. Están documentadas para quien quiera una estética distinta, no como mejoras pendientes.

### A. Modelo `.glb` en vez de geometría procedural

`public/models/character.glb` (118 KB) sigue en el repo. Es el **pato de muestra de Khronos**, no un modelo hecho para este proyecto: sirve para probar la tubería de carga, no como pieza visual final.

Para activarlo, sustituye el contenido de `Model.tsx` por `useGLTF` y mantén el resto de la escena igual — la rotación por scroll y la interpolación de `accentColor` no cambian:

```tsx
const { scene } = useGLTF('/models/character.glb')
// … mismo useFrame: rotación por scroll.offset, pulso, emisivo del keyframe
return <primitive object={scene} ref={groupRef} />
```

Requisitos que no son opcionales si tomas este camino:
- `useGLTF.preload('/models/character.glb')` al final del archivo.
- El `<Suspense>` ya existe y ya está **dentro** del `<Canvas>` (§9). No lo muevas.
- Si el modelo viene comprimido con Draco, drei necesita el decoder; sirve el CDN de Google.

Coste: +118 KB de descarga, un request más, y el bloom deja de funcionar igual — el wireframe emisivo con `toneMapped={false}` es lo que alimenta el `luminanceThreshold={0.9}`. Un modelo con materiales PBR normales apenas brillará, así que habrá que rebajar el umbral o añadirle emisivo.

### B. Campo de partículas de fondo

`src/components/canvas/ParticleField.tsx` **existe pero está vacío**: es un stub que devuelve `<div>ParticleField</div>`, herencia del andamiaje original. Tal cual está, montarlo dentro de `<Scene>` rompe — R3F intentaría reconciliar un elemento del DOM dentro del árbol de Three.js.

Si lo quieres de verdad, hay que implementarlo: un `<points>` con `bufferGeometry` de posiciones aleatorias y un `pointsMaterial` pequeño, con deriva lenta en `useFrame`. Coste: unos cuantos miles de vértices y una llamada de dibujo más. Compite visualmente con el fondo shader, que ya aporta movimiento — si añades ambos, baja la intensidad de uno.

Antes de invertir ahí: el fondo shader y el bloom ya dan la sensación inmersiva. Las partículas suelen sumar ruido, no profundidad.

---

## 12. Checklist de "la animación quedó bien"

- [ ] Fondo shader respirando, **detrás** del núcleo, visible ya durante la carga.
- [ ] El fondo cambia de verde (`Toxic`) a naranja (`Solar`) al pulsar el theme toggle, con cross-fade de ~0.7 s y sin deformar el patrón.
- [ ] Núcleo icosaedro wireframe visible, con bloom, latiendo.
- [ ] Al scrollear: el núcleo rota, la cámara viaja, el bloom sube/baja, el accent va de `#39ff14` a `#7cff3d` y vuelve.
- [ ] Desplazamiento sutil de cámara al mover el mouse.
- [ ] **El scroll llega hasta el final de la última sección** (FAQ), sin corte.
- [ ] Las cards de todas las secciones aparecen al entrar en viewport. Ninguna se queda invisible.
- [ ] Consola sin errores de WebGL/shader.
- [ ] `useFrame` sin `setState`; sin `.glb` cargado.
