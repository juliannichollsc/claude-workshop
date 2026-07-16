Toma el proyecto que dejó `PROMPT-1-PROYECTO-BASE.md` —Vite + React 19 + TS, dependencias instaladas, placeholders y **el hero funcionando**— y construye **todo lo que falta**: agentes, skills, la escena 3D animada, el tema claro/oscuro y las siete secciones con su contenido.

Este es el **paso 2 de 2**, y está pensado para ejecutarse en una **sesión nueva y limpia**: no asumas contexto de la sesión anterior. Todo lo que necesitas saber está en este archivo y en las tres docs que se listan abajo.

El paso 1 solo demostró que el stack engancha. Aquí se construye la experiencia.

**Package manager obligatorio: `pnpm`.** Nunca `npm`/`npx` para este proyecto. Si una skill o un agente sugiere `npm install`, tradúcelo antes de ejecutarlo.

**Docs que son fuente de verdad** — léelas antes de escribir código, no después:
- `docs/ANIMACION-3D.md` — la escena 3D, y las tres decisiones de arquitectura que costaron una sesión de depuración cada una.
- `docs/CONTENIDO-CLAUDE.md` — el texto exacto de las 7 secciones y los errores de datos que ya se cometieron.
- `docs/testing-background.md` — el shader del fondo y sus presets.

---

## FASE 0 — Agentes, skills y configuración

### Agentes (`.claude/agents/`)

Crea **dos** agentes, ambos con `model: sonnet` por eficiencia de tokens:

- **`technical-agent.md`** — Three.js, canvas, hooks, tipos, datos, scroll.
- **`qa-agent.md`** — verificación: build, navegación, responsive, performance. Nunca modifica código; solo lee y reporta a la sesión principal.

**No crees un `ui-agent`.** Existió y se eliminó: consumía demasiados tokens y colisionaba con el trabajo de animación y Three.js del technical-agent. Lo visual lo hace la sesión principal, que ya tiene el contexto de la escena 3D cargado y no necesita reconstruirlo en otra ventana.

La sesión principal orquesta directamente: descompone, delega con la herramienta Agent, resuelve conflictos y verifica compatibilidad entre outputs. No hay agente orchestrator.

### Skills (`.claude/skills/` → symlinks a `.agents/skills/`)

Instálalas con la CLI externa (`npx skills` es la única excepción a la regla de pnpm, porque así lo documenta su propio proyecto) y deja `skills-lock.json` versionado. Las que se usan de verdad:

| Skill | Para qué |
|---|---|
| `react-three-fiber`, `threejs-webgl` | Canvas, `useFrame`, shaders |
| `gsap-core`, `gsap-timeline` | Tweens del DOM |
| `frontend-design`, `ui-ux-pro-max` | Dirección visual |
| `color-theory`, `color-mode-and-theme` | Paleta y el par dark/light |
| `tailwind-css-patterns`, `tailwindcss-animations` | Utilidades |
| `accessibility-a11y` | Focus, `prefers-reduced-motion` |
| `claude-api` | **Obligatoria** antes de escribir la sección de modelos |

> `gsap-scrolltrigger` está instalada pero **no la uses** — ver FASE 1, trampa 3.

### `CLAUDE.md`

Escríbelo en la raíz con: la regla de orquestación (dos agentes), el stack, `pnpm` obligatorio, la arquitectura 3D+HTML, las convenciones de código y la separación de responsabilidades. Debe contener explícitamente las cuatro prohibiciones que este prompt establece (sin `ui-agent`, sin ScrollTrigger, sin `.glb`, sin reset `*` fuera de capa).

---

## FASE 1 — La escena 3D (delegar a technical-agent)

Reproduce `docs/ANIMACION-3D.md`. La capa 3D lee su estado **solo** de `src/config/sequence.ts`; no conoce el contenido HTML.

Archivos: `Scene.tsx`, `Model.tsx`, `Lighting.tsx`, `CameraRig.tsx`, `PostFX.tsx`, `AnimatedBackground.tsx`, `ToxicBackdrop.tsx`, más `hooks/useScrollProgress.ts` y `hooks/useSequence.ts`.

`sequence.ts` tiene **7 keyframes** (`hero`, `skills`, `frameworks`, `languages`, `extend`, `experience`, `faq`), una vuelta completa repartida en tramos de π/3, y exporta `INITIAL_PAGES = SEQUENCE.length`.

### Las tres trampas. No las descubras por tu cuenta.

**1. El fondo shader va DENTRO del `<Canvas>`.**
Montarlo como `<canvas>` propio en `fixed inset-0 -z-10` parece lo natural y funciona… hasta que arranca el post-procesado, que le roba el contexto WebGL y el fondo se queda negro. `ToxicBackdrop` dibuja el mismo fragment shader sobre un `planeGeometry [2,2]` con `rawShaderMaterial` y `glslVersion={GLSL3}`, emitiendo los vértices en clip-space (así ignora la cámara y siempre cubre el viewport), con `renderOrder={-1}`, `depthTest={false}`, `depthWrite={false}`, `toneMapped={false}`. Va **fuera del `<Suspense>`** para que se vea durante la carga.

`AnimatedBackground.tsx` se conserva como fuente de `presets`, `FRAGMENT_SHADER`, `PatternShapes`, `hexToRgba` y `THEME_PRESET`; su componente por defecto no se monta.

**2. `pages` de `ScrollControls` no es el número de secciones.**
Es la altura del spacer en múltiplos del viewport, y drei **no mide el contenido**. Las secciones son `min-h-screen`, así que las densas (timeline, FAQ) superan 100vh: el DOM acaba midiendo más que `SEQUENCE.length` viewports y el scroll se corta en la última sección. Hay que medir:

```tsx
function ScrollContent({ onPages, children }) {
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
    const observer = new ResizeObserver(measure)   // el contenido crece al cargar fuentes
    observer.observe(el)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [onPages])
  return <div ref={ref} className="relative z-10 w-full">{children}</div>
}
```

`useScrollProgress` devuelve `scroll.offset` (0..1), independiente de `pages`, así que medir el spacer no descoloca la secuencia.

**3. ScrollTrigger de GSAP no funciona contra el scroller de drei.**
`<Scroll html>` no scrollea el contenido: lo deja quieto y le aplica `transform: translate3d(...)` al wrapper. ScrollTrigger cruza rects del DOM con el `scrollTop` del scroller y esas dos medidas se contradicen — los triggers no disparan y las cards se quedan en `autoAlpha: 0` para siempre, mientras los headers sí se ven. El síntoma engaña: parece un bug de centrado.

El reveal se hace con `IntersectionObserver`, que mide contra el viewport y respeta los transforms — `src/hooks/useReveal.ts`:

```ts
export function useReveal(sectionRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = sectionRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return  // ya es visible

    const reveal = root.querySelectorAll('.reveal')
    const steps = root.querySelectorAll('.timeline-step')
    const ctx = gsap.context(() => {
      gsap.set(reveal, { autoAlpha: 0, y: 42 })
      gsap.set(steps, { autoAlpha: 0, x: -32 })
    }, root)

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()                       // una sola vez: sin reverse
      ctx.add(() => {
        gsap.to(reveal, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09 })
        gsap.to(steps, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.12 })
      })
    }, { threshold: 0.15 })
    observer.observe(root)

    return () => { observer.disconnect(); ctx.revert() }
  }, [sectionRef])
}
```

### Modelo

**Geometría procedural, sin `.glb`.** Icosaedro wireframe (núcleo `args={[1.1, 1]}`) más una cáscara `scale={1.6}` con `args={[1.1, 2]}`, `transparent`, `opacity={0.25}`, que contrarrota. `toneMapped={false}` en ambos para que el emisivo entre fuerte al bloom. `useFrame` **nunca** llama `setState`; los `Color` de interpolación viven fuera del componente para no generar GC por frame.

Es la opción por defecto **por presupuesto**: el bundle ya ronda 1.3 MB (371 KB gzip) y `three` es la mayor parte. La geometría procedural cuesta 0 KB y 0 requests, y su emisivo es justo lo que alimenta el bloom. Si alguien quiere un `.glb` o un campo de partículas en su lugar, `docs/ANIMACION-3D.md` §11 explica cómo y qué cuesta cada uno. **No los actives por tu cuenta.**

---

## FASE 2 — Tema, estilos y sistema de UI

### Tema

`data-theme` en `<html>` es la **única fuente de verdad**. `src/hooks/useTheme.ts` lo expone con `useSyncExternalStore` + `MutationObserver`; `initTheme()` corre en `main.tsx` **antes del primer render**, para que el fondo 3D no nazca verde y salte al color claro. `setTheme()` envuelve el cambio en `document.startViewTransition` cuando existe.

El fondo shader lo consume: `THEME_PRESET = { dark: 'Toxic', light: 'Solar' }`. Los dos presets comparten **geometría idéntica** y solo cambian los colores, para que el switch sea un cross-fade y no una deformación del patrón. `useFrame` interpola los uniforms con damping exponencial (~0.7 s), acotando `delta` a `0.1` porque una pestaña en background lo devuelve enorme.

### `src/styles/index.css`

```css
@import "tailwindcss";

/* Paleta Toxic (dark, default) */
:root, :root[data-theme='dark'] {
  --color-bg: #050d05;  --color-accent: #39ff14;  --color-accent-secondary: #7cff3d;
  /* surface, text, text-muted, border, --expo-out, fuentes… */
}
/* Light = par cálido-contrario (verde neón ~110° ↔ naranja ~25°) */
:root[data-theme='light'] {
  --color-bg: #fdf6ec;  --color-accent: #ea580c;  --color-accent-secondary: #b91c1c;
}
```

**Nunca `* { margin: 0; padding: 0 }`.** En la cascada de CSS, una regla **sin capa gana a toda regla dentro de una capa**, sin importar la especificidad. Las utilidades de Tailwind v4 viven en `@layer utilities`, así que ese reset anula `p-*`, `m-*`, `px-*`, `py-*` y `space-y-*` **en toda la app**: el texto toca los bordes de las cards y las cards se pegan entre sí, pero `gap-*` sigue funcionando (no es margin ni padding), lo que hace el diagnóstico confuso. El preflight de Tailwind ya pone `box-sizing` y `margin`/`padding` a cero en `@layer base`.

Por lo mismo, las clases propias (`.glass`, `.gradient-text`, `.glow-text`, `.glow-dot`, `.text-scrim`, `.font-display`) van dentro de `@layer components`, para que las utilidades puedan sobrescribirlas. `html, body, #root` va en `@layer base`.

Incluye la transición de tema (`::view-transition-*` con clip-path poligonal) y el bloque `prefers-reduced-motion`.

### Componentes de UI (`src/components/ui/`)

`Section`, `Card`, `Badge`, `Eyebrow`, `Metric`, `Timeline`, `ScrollIndicator`, `ThemeToggle`.

**`Section`** es el shell y resuelve el centrado:

```tsx
<section ref={sectionRef} className="relative w-full">
  {decoration}
  <div className="flex min-h-screen w-full items-center justify-center px-6 py-24 md:px-12">
    <div className={clsx('w-full text-center', maxWidth)}>{children}</div>
  </div>
</section>
```

- `w-full`, **no `w-screen`**: `100vw` incluye la barra de scroll del contenedor de drei y cada sección sobresale unos píxeles a la derecha.
- El `<Scroll html>` de App necesita `style={{ width: '100vw' }}`: el wrapper `position:absolute; left:0` que genera drei no tiene width y se encoge al contenido, dejando todo pegado a la izquierda.

**Reglas de centrado.** Los headers van centrados. Dentro de las cards, **el bloque se centra pero las líneas se alinean a la izquierda** (`mx-auto max-w-md text-left`). Nunca `justify-center` en un `<li>` junto a `text-left`: centra cada línea por separado y deja el margen izquierdo dentado. Para rejillas de cards usa `grid md:grid-cols-2` con `items-start`, no `columns-2` — CSS multi-column reparte por altura y descuelga la segunda columna.

**`Badge`** codifica capacidad con la intensidad del pill: `frontier` es el único de relleno sólido, y baja hasta el borde apagado de `fast`.

---

## FASE 3 — Contenido y secciones

Los tipos van en `src/types/cv.ts`, el contenido en `src/data/cv.ts` como `content` con `as const satisfies Content`. **Cero texto hardcodeado en componentes.** El `satisfies` hace que el build falle si tipos y datos divergen: es la red de seguridad, no la burocracia.

Siete secciones, en este orden — **debe coincidir con `SEQUENCE`**, porque `useSequence` interpola por índice:

| # | Componente | Keyframe | Contenido |
|---|---|---|---|
| 1 | `HeroSection` | `hero` | **Ya existe** (paso 1). Envuélvelo en `<Section>` y añade su timeline de entrada. |
| 2 | `SkillsSection` | `skills` | 4 cards de capacidades |
| 3 | `FrameworksSection` | `frameworks` | 4 modelos + 5 niveles de effort |
| 4 | `LanguagesSection` | `languages` | 3 métricas + reglas de contexto |
| 5 | `ExtendSection` | `extend` | MCP, Skills, subagentes, hooks |
| 6 | `ExperienceSection` | `experience` | El loop, como timeline |
| 7 | `FaqSection` | `faq` | 4 preguntas + CTA a la doc |

Cada sección: `useRef` + `useReveal(sectionRef)`, `<Section>` con un `decoration` (glow radial `blur-[130px]`, `opacity-[0.06]`), header con `<Eyebrow>` y `.reveal` en todo lo que deba aparecer.

**El texto exacto está en `docs/CONTENIDO-CLAUDE.md`. Cópialo de ahí, no lo inventes.** Ese doc también lista los errores de datos que ya se cometieron una vez (Fable 5 tratado como modelo de nicho, la ventana de 200K de Haiku omitida, `effort` con cuatro niveles en vez de cinco). **Carga la skill `claude-api` y verifica el line-up antes de escribir la sección de modelos.** No escribas de memoria: los modelos cambian.

---

## Verificación

```bash
pnpm build      # debe compilar sin errores de TypeScript
pnpm dev
```

Checklist manual, en el navegador:

- [ ] El fondo shader respira detrás del núcleo, visible ya durante la carga.
- [ ] El theme toggle cambia el fondo de verde a naranja con cross-fade de ~0.7 s, sin deformar el patrón.
- [ ] Al scrollear: el núcleo rota, la cámara viaja, el bloom sube y baja.
- [ ] **Las cards de todas las secciones aparecen al entrar en viewport.** Ninguna se queda invisible. (Si alguna no aparece: `opacity: 0; visibility: hidden` en el DOM significa que el tween nunca corrió — revisa la trampa 3.)
- [ ] **El scroll llega al final de la última sección**, sin corte. (Si se corta: `pages` no se está midiendo — trampa 2.)
- [ ] Las cards tienen padding interno y separación entre ellas. (Si el texto toca los bordes: hay un reset `*` fuera de capa — FASE 2.)
- [ ] Consola sin errores de WebGL/shader.

---

## Fuera de alcance

No reintroduzcas el `ui-agent`. No uses ScrollTrigger. No cargues un `.glb` ni añadas partículas: el núcleo es geometría procedural, y las alternativas están documentadas en `ANIMACION-3D.md` §11 como opt-in, con su coste de bundle — no son trabajo pendiente de este prompt.

`HeroSection` y `Eyebrow` ya existen del paso 1 — extiéndelos, no los reescribas desde cero.
