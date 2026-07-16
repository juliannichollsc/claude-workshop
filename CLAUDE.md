# Claude Dev 3D SPA — Workshop Project

## REGLA OBLIGATORIA
No hay agente orchestrator: **la sesión principal de Claude Code orquesta directamente** — analiza la tarea, la descompone y delega a los subagentes especializados con la herramienta Agent/Task, en este orden: technical-agent → qa-agent.
- technical-agent: todo lo técnico (Three.js, canvas, hooks, tipos, datos, scroll)
- qa-agent: verificación (build, navegación, responsive, performance) — reporta directo a la sesión principal, nunca a un agente intermedio

**No hay ui-agent.** Se eliminó: consumía demasiados tokens y colisionaba con el trabajo de animación y Three.js del technical-agent. Lo visual (componentes, Tailwind, GSAP, layout, responsive) lo hace **la sesión principal**, que ya tiene el contexto de la escena 3D y no necesita reconstruirlo. No lo reintroduzcas.

Los subagentes corren en `model: sonnet` (eficiencia de tokens); la sesión principal corre en su propio modelo y es quien resuelve conflictos y verifica compatibilidad entre outputs.

## Documentación — fuentes de verdad
- `docs/PROMPT-1-PROYECTO-BASE.md` — paso 1: andamio + hero. Nada más.
- `docs/PROMPT-2-CONSTRUIR-SPA.md` — paso 2: agentes, escena 3D, tema y las 7 secciones. Se ejecuta en sesión nueva.
- `docs/ANIMACION-3D.md` — la escena 3D y las tres trampas de arquitectura (shader dentro del Canvas, `pages` medido, nada de ScrollTrigger).
- `docs/CONTENIDO-CLAUDE.md` — el texto exacto de las secciones y los errores de datos ya cometidos.

Si cambias el código, actualiza la doc correspondiente en el mismo turno. Una doc que describe un proyecto que ya no existe es peor que no tenerla.

## Stack
- React 19 + TypeScript + Vite
- @react-three/fiber + @react-three/drei para 3D
- Tailwind CSS v4 para estilos
- GSAP + @gsap/react para animaciones de entrada del DOM
- Lenis para smooth scroll

## Package manager
**pnpm es obligatorio** — nunca npm ni yarn. Todo comando de instalación, build o dev en este proyecto y en los PROMPT-*.md usa `pnpm`. Si algún agente o skill sugiere `npm install`/`npx`, tradúcelo a `pnpm add`/`pnpm dlx` antes de ejecutarlo.

## Arquitectura 3D + HTML
- El <Canvas> ocupa viewport completo (position fixed, z-index 0)
- Las secciones HTML se renderizan dentro de <Scroll html> de drei
- El modelo 3D se controla con useScroll() — solo rota en eje X vertical
- El modelo permanece centrado en pantalla, el contenido HTML scrollea alrededor

## Modelo 3D
- **Geometría procedural, sin .glb.** Model.tsx es un icosaedro wireframe (núcleo + cáscara que contrarrota). Cuesta 0 KB de bundle, que ya ronda 1.3 MB por `three`.
- Alternativas opt-in documentadas en `docs/ANIMACION-3D.md` §11: cargar `public/models/character.glb` con useGLTF (+118 KB, y el bloom deja de funcionar igual), o implementar `ParticleField.tsx` — hoy es un stub que devuelve un `<div>` y rompería dentro del Canvas. Ninguna se activa sin pedirlo.
- Suspense sigue siendo obligatorio DENTRO del Canvas (nunca envolviéndolo desde fuera).

## Convenciones de código
- Componentes: PascalCase, un componente por archivo, export default
- Tailwind: usar clsx() para clases condicionales, nunca CSS modules
- **Nada de `* { margin: 0; padding: 0 }` en index.css.** Una regla sin @layer gana a toda regla dentro de una capa: anularía las utilidades de espaciado de Tailwind v4 en toda la app. El preflight ya lo hace.
- Animaciones DOM: GSAP disparado por IntersectionObserver (`src/hooks/useReveal.ts`). **NUNCA ScrollTrigger**: mide contra el scroller de drei, que mueve el contenido con transform, y los triggers no disparan.
- Animaciones 3D: useFrame de R3F exclusivamente, NUNCA GSAP para objetos Three.js
- Contenido: importar siempre de src/data/cv.ts, nunca hardcodear texto en componentes
- Tipos: todo tipado, importar interfaces desde src/types/cv.ts
- El orden de las secciones en App.tsx debe coincidir con el de SEQUENCE en config/sequence.ts — useSequence interpola por índice.

## Performance
- useFrame NUNCA debe llamar setState — solo mutaciones directas a refs
- Modelo debe pesar <5MB después de optimización
- Imágenes en WebP, lazy load cuando aplique
- Bundle size: mantener bajo control, no instalar dependencias innecesarias

## Separación de responsabilidades
- src/components/canvas/, src/data/, src/types/, src/hooks/ → technical-agent
- src/components/sections/ y src/components/ui/ → la sesión principal (no hay ui-agent)
- qa-agent NUNCA modifica código, solo lee y reporta
