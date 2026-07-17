# Solución — bug de la animación 3D (fondo Toxic + crash del Canvas)

Este documento describe los **dos** defectos de la capa 3D (`PROMPT-2`) y su corrección.
Ambos viven solo en `src/components/canvas/`. El commit/push queda **pendiente de tu
confirmación** de que en tu máquina se ve arreglado (ver "Git" al final).

---

## Bug 1 — El fondo shader no aparece (no compila)

**Síntoma:** el núcleo wireframe flota sobre un vacío liso del color de `--color-bg`;
el fondo shader no se ve. En consola: `THREE.WebGLProgram: Shader Error ... '#version' :
must occur before anything else`.

**Causa raíz:** `ToxicBackdrop` usa `rawShaderMaterial` con `glslVersion={GLSL3}`, lo que
hace que three **anteponga** la directiva `#version 300 es`. Pero el `VERTEX_SHADER` y el
`FRAGMENT_SHADER` (copiado de `AnimatedBackground.tsx`, que nació para un contexto WebGL2
propio) **ya abrían con `#version 300 es`**. Resultado: dos directivas → GLSL falla → la
malla existe pero no dibuja nada.

**Fix** (`src/components/canvas/ToxicBackdrop.tsx`):
1. Se quitó `#version 300 es` del `VERTEX_SHADER` (three la pone por `glslVersion`).
2. Se quita del fragment importado: `const FRAGMENT = FRAGMENT_SHADER.replace('#version 300 es\n', '')`.
3. Se añadió `frustumCulled={false}` a la malla: el vertex shader emite los vértices en
   clip-space e ignora la cámara, pero three calcula el culling contra la bounding sphere
   del `planeGeometry [2,2]` en el origen; al mover `CameraRig` la cámara con el scroll,
   three cree que el plano salió de cuadro y deja de dibujarlo (el fondo desaparecía a
   media página).

Se mantiene `glslVersion={GLSL3}` (el shader usa `in`/`out`/`fragColor`, sintaxis GLSL ES 3.00).
Corresponde a `PROMPT-3`, TAREA 1.

---

## Bug 2 — `Uncaught TypeError: cyclic object value` (crash del Canvas)

**Síntoma:** al cargar, la app lanza `Uncaught TypeError: cyclic object value` (Firefox) /
`Converting circular structure to JSON` (Chrome), con stack solo de react-dom/scheduler, y
el `<CanvasImpl>` se desmonta ("Consider adding an error boundary").

**Evidencia** (capturada por CDP con Chrome headless):

```
TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'children' -> object with constructor 'Array'
    |     index 0 -> object with constructor 'Object'
    --- property 'parent' closes the circle
    at JSON.stringify (<anonymous>)
    at @react-three_postprocessing.js:15484   ← useMemo(..., [JSON.stringify(props)])
```

**Causa raíz:** el wrapper de efectos de `@react-three/postprocessing@3` memoiza sus props
con `useMemo(() => [...], [JSON.stringify(props)])`. En **React 19 el `ref` se pasa como una
prop normal** a los componentes función. Nuestro `PostFX` hacía:

```tsx
const bloomRef = useRef<BloomEffect>(null)
<Bloom ref={bloomRef} luminanceThreshold={0.9} luminanceSmoothing={0.3} intensity={...} />
```

Cuando ese `ref` se puebla con el `BloomEffect` (que internamente referencia una escena
Three con ciclo `children ↔ parent`), `JSON.stringify(props)` intenta serializarlo, encuentra
el ciclo y **lanza**, tumbando el Canvas. En React 18 el `ref` no entraba en las props
(forwardRef lo separaba), por eso el patrón `<Bloom ref>` funcionaba antes: es una
incompatibilidad React 19 × `@react-three/postprocessing@3`.

**Fix** (`src/components/canvas/PostFX.tsx`): no pasar `ref` a `<Bloom>`. Se construye el
`BloomEffect` a mano y se monta con `<primitive>`, conservando la mutación de intensidad por
frame sobre nuestra propia instancia (sin `setState`, como exige la escena):

```tsx
const bloom = useMemo(() => new BloomEffect({
  luminanceThreshold: 0.9, luminanceSmoothing: 0.3,
  intensity: SEQUENCE[0].bloomIntensity, mipmapBlur: true,
}), [])

useFrame(() => { bloom.intensity = /* interpolado from→to por seq.t */ })

return <EffectComposer><primitive object={bloom} /></EffectComposer>
```

`EffectComposer` detecta el `<primitive>` cuyo `object` es `instanceof Effect` y lo envuelve
en un `EffectPass` — mismo resultado visual, sin el wrapper que serializa props.

---

## Verificación

- `pnpm build` → compila sin errores de TypeScript.
- Captura headless (Chrome + CDP, `pnpm dev`) **antes**: 2 × `Converting circular structure
  to JSON` + `<CanvasImpl>` desmontado. **Después**: **0 excepciones**.
- Checklist de `PROMPT-3`: sin `THREE.WebGLProgram: Shader Error`; el fondo se mantiene al
  scrollear hasta la última sección.

Warnings restantes (no bloqueantes): `THREE.Clock deprecated` (interno de drei), `GPU stall
ReadPixels` (solo swiftshader headless), y un `GSAP target [object NodeList] not found`
(revelado GSAP menor, ajeno al crash).

## Archivos modificados

- `src/components/canvas/ToxicBackdrop.tsx` — bug 1 (dos arreglos).
- `src/components/canvas/PostFX.tsx` — bug 2.

---

## Git (ejecutar SOLO tras tu confirmación de que se ve arreglado)

Este directorio **no es un repositorio git todavía** y no tiene remoto. Cuando confirmes,
los pasos serían:

```bash
git init
git add -A
git commit -m "fix(canvas): shader #version duplicado y crash de Bloom en React 19"
# requiere un remoto configurado por ti (no lo asumo):
# git remote add origin <URL>
# git push -u origin main
```

No inicializo git ni hago commit/push hasta que confirmes.
