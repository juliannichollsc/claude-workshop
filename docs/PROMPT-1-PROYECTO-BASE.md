Crea un proyecto desde cero llamado `claude-dev-3d-spa` con Vite + React 19 + TypeScript, **en esta misma carpeta del workshop** (junto a `.claude/`, `.agents/` y los `PROMPT-*.md` ya existentes) — no en una subcarpeta separada.

Este es el **paso 1 de 2**. Aquí se construye el andamio —dependencias, estructura, tipos, configuración— y **una sola vista funcionando: el hero**. Nada más. La experiencia inmersiva completa (escena 3D animada, tema claro/oscuro, las 7 secciones) la construye `PROMPT-2-CONSTRUIR-SPA.md` en una sesión nueva, partiendo exactamente de lo que dejes aquí.

Que el hero se vea y compile es el criterio de éxito: demuestra que Vite, React 19, Tailwind v4 y los tipos están bien enganchados, sin arrastrar el riesgo de la capa 3D.

**Skill a usar en este paso:** invoca `react-three-fiber` (ya instalada en `.agents/skills/`) solo para verificar que las versiones de R3F y drei encajan con React 19. No montes un `<Canvas>` todavía.
**Fuera de alcance:** ninguna skill de diseño (`frontend-design`, `ui-ux-pro-max`, `color-theory`, `color-mode-and-theme`). Este paso no toma decisiones visuales más allá de aplicar la paleta que se te da.

**Package manager obligatorio: pnpm.** Nunca `npm install`/`npx` para dependencias o scripts de este proyecto — solo `pnpm add`/`pnpm dlx`. La única excepción es una CLI externa de terceros que se invoque explícitamente vía `npx` en su propia documentación (ej. `npx skills`), nunca para el propio proyecto.

## Comandos de instalación

El proyecto se construye **en esta misma carpeta** (`workshop-claude/`), la que ya tiene `.claude/` y `.agents/`. Como el directorio actual ya tiene archivos, el scaffold de Vite se genera aparte y se mueve a la raíz sin tocar lo existente:

```bash
pnpm create vite@latest claude-dev-3d-spa --template react-ts
rsync -a --remove-source-files claude-dev-3d-spa/ ./
find claude-dev-3d-spa -type d -empty -delete

pnpm add react@^19.2.0 react-dom@^19.2.0
pnpm add three@^0.185.0 @react-three/fiber@^9.6.0 @react-three/drei@^10.7.0 @react-three/postprocessing@^3.0.0 postprocessing@^6.39.0
pnpm add gsap@^3.15.0 @gsap/react@^2.1.2 motion@^12.42.0 lenis@^1.3.0 maath@^0.10.0 clsx@^2.1.0
pnpm add tailwindcss@^4.3.0 @tailwindcss/vite@^4.3.0
pnpm add -D @types/three@^0.185.0

pnpm install
pnpm dev
```

**Restricción de versiones — no la negocies:**
`@react-three/fiber@9` declara el peer `react: ">=19 <19.3"` y `@react-three/drei@10` declara `react: "^19"`. Con React 18 la instalación queda con peers rotos. Este proyecto usa **React 19**. Si `pnpm` reporta un `ERR_PNPM_PEER_DEP_ISSUES`, resuélvelo alineando versiones, **nunca** con `--force` ni con `.npmrc strict-peer-dependencies=false`.

## Rol de cada dependencia

| Paquete | Para qué |
|---|---|
| `@react-three/fiber` | Renderer de React para Three.js. El `<Canvas>`, `useFrame`, `useThree` |
| `@react-three/drei` | Helpers: `ScrollControls`, `useScroll`, `ContactShadows` |
| `@react-three/postprocessing` + `postprocessing` | Efectos de cámara: `Bloom`. Es el 80% de la sensación "inmersiva" |
| `maath` | `easing.damp3` para interpolación suave de cámara sin jank |
| `gsap` + `@gsap/react` | Tweens de entrada del DOM |
| `motion` | Transiciones declarativas y micro-interacciones |
| `lenis` | Smooth scroll |
| `clsx` | Clases condicionales de Tailwind |

Ninguno de los dos motores de animación toca objetos Three.js: eso es `useFrame`, siempre.

## Estructura de carpetas

Crea esta estructura completa. Los `.tsx` de `canvas/` son placeholders: solo el `export default` de un componente que devuelve `null` o un fragment, para que compile. `HeroSection.tsx` **sí se implementa de verdad**.

```
workshop-claude/
├── public/
├── src/
│   ├── components/
│   │   ├── canvas/              ← placeholders, se implementan en el paso 2
│   │   │   ├── Scene.tsx
│   │   │   ├── Model.tsx
│   │   │   ├── Lighting.tsx
│   │   │   ├── CameraRig.tsx
│   │   │   └── PostFX.tsx
│   │   ├── sections/
│   │   │   └── HeroSection.tsx  ← la única vista real de este paso
│   │   └── ui/
│   │       └── Eyebrow.tsx      ← el único componente de UI de este paso
│   ├── config/
│   │   └── sequence.ts
│   ├── data/
│   │   └── cv.ts
│   ├── hooks/
│   │   ├── useScrollProgress.ts
│   │   └── useSequence.ts
│   ├── types/
│   │   ├── cv.ts
│   │   └── sequence.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

No crees `public/models/`: el modelo 3D del paso 2 es **geometría procedural**, no un `.glb`.

## `src/types/cv.ts`

Solo el contrato del hero. El paso 2 añade `capabilities`, `models`, `context`, `extend`, `howItWorks` y `faq`.

```typescript
export interface HeroContent {
  eyebrow: string
  name: string
  subtitle: string
  tagline: string
  meta: readonly string[]
}

export interface LinksContent {
  docs: string
  github: string
  site: string
}

export interface Content {
  hero: HeroContent
  links: LinksContent
}
```

## `src/data/cv.ts`

El contenido vive aquí y se importa. **Cero texto hardcodeado en componentes** — esta regla arranca ya.

```typescript
import type { Content } from '../types/cv'

export const content = {
  hero: {
    eyebrow: 'AI CODING AGENT',
    name: 'Claude Code',
    subtitle: 'El agente que escribe, ejecuta y verifica código',
    tagline:
      'Vive en tu terminal: lee tu codebase, edita múltiples archivos, corre los tests y cierra el loop hasta que compila — no solo sugiere, actúa.',
    meta: ['PLAN → ACT → OBSERVE → CORRECT', 'CONTEXTO 1M TOKENS', 'TERMINAL · IDE · WEB'],
  },
  links: {
    docs: 'https://docs.claude.com/claude-code',
    github: 'https://github.com/anthropics/claude-code',
    site: 'https://claude.com',
  },
} as const satisfies Content
```

`as const satisfies Content` es la red de seguridad: si los datos y los tipos divergen, el build falla.

## `src/types/sequence.ts`

Contrato de la experiencia inmersiva del paso 2. Cada sección corresponde a un keyframe: cámara, modelo y efectos se interpolan entre keyframes según el progreso del scroll.

```typescript
export type Vec3 = [number, number, number]

/** Un keyframe = el estado de la escena cuando una sección está centrada. */
export interface SequenceKeyframe {
  id: string
  cameraPosition: Vec3
  cameraTarget: Vec3
  /** rotación acumulada del modelo, en radianes */
  modelRotation: Vec3
  modelPosition: Vec3
  /** intensidad del bloom (0 = apagado) */
  bloomIntensity: number
  accentColor: string
}

export interface SequenceState {
  /** progreso global del scroll, 0..1 */
  progress: number
  /** índice del keyframe anterior */
  from: number
  /** índice del keyframe siguiente */
  to: number
  /** progreso local entre `from` y `to`, 0..1 */
  t: number
}
```

## `src/config/sequence.ts`

Un solo keyframe, el del hero. El paso 2 lo amplía a los 7 de la secuencia real.

```typescript
import type { SequenceKeyframe } from '../types/sequence'

// Paleta "Toxic": #050d05 / #0a240a / #39ff14
export const SEQUENCE: SequenceKeyframe[] = [
  { id: 'hero', cameraPosition: [0, 0, 5], cameraTarget: [0, 0, 0], modelRotation: [0, 0, 0], modelPosition: [0, -1, 0], bloomIntensity: 0.6, accentColor: '#39ff14' },
]

/**
 * Valor inicial de `pages` para ScrollControls (paso 2).
 *
 * NO es "número de secciones": `pages` es la altura del spacer en múltiplos del viewport,
 * y drei no mide el contenido. El paso 2 mide el DOM real y corrige este valor.
 */
export const INITIAL_PAGES = SEQUENCE.length
```

## `src/hooks/`

Placeholders tipados que compilen. `useScrollProgress()` devuelve `number` (por ahora `0`); `useSequence()` devuelve `SequenceState`. La implementación real usa `useScroll()` de drei y necesita vivir dentro de `<ScrollControls>`, que aún no existe — va en el paso 2.

## `src/components/ui/Eyebrow.tsx`

Chip mono en mayúsculas con un punto que emite glow. Ancla visualmente cada sección. Recibe `children` y `className`, usa `clsx`, y toma el color de `var(--color-accent)`.

## `src/components/sections/HeroSection.tsx`

La única vista real. Sin 3D, sin GSAP, sin scroll: solo layout estático centrado, leyendo todo de `content.hero`.

- Contenedor a pantalla completa, contenido centrado en ambos ejes, `max-w-3xl`.
- `<Eyebrow>` con `hero.eyebrow`.
- `<h1>` con `hero.name`, tipografía display grande (`text-6xl md:text-8xl`), en gradiente de `--color-accent` a `--color-accent-secondary`.
- `hero.subtitle` como párrafo destacado, `hero.tagline` como párrafo secundario en `--color-text-muted`.
- `hero.meta` como chips mono con borde, en una fila que envuelve.

## `src/styles/index.css`

```css
@import "tailwindcss";

/* Paleta "Toxic" — verde neón sobre casi negro. Evoca un terminal vivo.
   El par claro/oscuro y el theme toggle llegan en el paso 2. */
:root {
  --color-bg: #050d05;
  --color-surface: rgba(8, 26, 8, 0.72);
  --color-accent: #39ff14;
  --color-accent-secondary: #7cff3d;
  --color-text: #f1f5f9;
  --color-text-muted: #9db8a4;
  --color-border: rgba(57, 255, 20, 0.16);
}

/* NO añadas `* { margin: 0; padding: 0 }` aquí.
   Una regla sin @layer gana a TODA regla dentro de una capa, sea cual sea su
   especificidad — y las utilidades de Tailwind v4 viven en `@layer utilities`.
   Ese reset anularía p-*, m-*, px-*, py-* y space-y-* en toda la app: el texto
   tocaría los bordes de las cards. Confuso de diagnosticar, porque `gap-*`
   sobrevive (no es margin ni padding). El preflight de Tailwind ya pone
   box-sizing y margin/padding a cero en `@layer base`. */

@layer base {
  html, body, #root {
    width: 100%;
    height: 100%;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, sans-serif;
  }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

`overflow: hidden` en `html, body` llega en el paso 2, cuando `<ScrollControls>` se hace cargo del scroll. Aquí estorbaría.

## `vite.config.ts`

Plugins de `@vitejs/plugin-react` y `@tailwindcss/vite`.

## `src/App.tsx` y `src/main.tsx`

`App.tsx` renderiza `<HeroSection />` y nada más. `main.tsx` importa `styles/index.css` y renderiza `App` con `createRoot`.

**Sin `<StrictMode>`.** En dev, React 19 monta dos veces, y en el paso 2 el `<Scroll html>` de drei llama `createRoot()` sobre el mismo contenedor y avisa. Quitarlo desde ya evita un cambio confuso más adelante.

## Verificación

```bash
pnpm build
pnpm dev
```

- [ ] El build compila sin errores de TypeScript.
- [ ] `pnpm dev` levanta sin warnings de peer dependencies.
- [ ] El hero se ve centrado, con el nombre en gradiente verde y los tres chips mono debajo.
- [ ] Los chips tienen padding interno. Si el texto toca el borde, se coló un reset `*` sin capa.

## Fuera de alcance en este paso

No crees `CLAUDE.md`, ni `.claude/`, ni agentes, ni skills, ni `.mcp.json`. No montes el `<Canvas>`, ni `ScrollControls`, ni el fondo shader, ni el theme toggle. No implementes las otras seis secciones ni la lógica de la secuencia. Todo eso es el paso 2.
