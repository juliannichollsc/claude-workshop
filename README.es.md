# Claude Dev 3D SPA — Workshop de Vibecoding

> SPA 3D inmersiva sobre **Claude Code**, construida casi por completo **por Claude Code** mediante **vibecoding** guiado por documentación, con skills cargadas y subagentes orquestados.
>
> React 19 · React Three Fiber · Tailwind v4 · GSAP · Lenis

🌐 **Español** · **[English](./README.md)** &nbsp;·&nbsp; 🚀 **[Demo en vivo →](https://workshop-claude-sigma.vercel.app)**

[![Resultado final — la sección hero](./docs/assets/hero.png)](https://workshop-claude-sigma.vercel.app)

---

## Qué es esto

Este repositorio es un **workshop práctico**: un experimento reproducible para construir un producto real e inmersivo usando Claude Code como developer — no como autocompletado, sino como un agente que planifica, edita múltiples archivos, corre el build y cierra el loop hasta que compila.

**🔗 En vivo:** https://workshop-claude-sigma.vercel.app — desplegada gratis en Vercel.

El resultado es la SPA de la captura de arriba: un icosaedro wireframe flotando en un shader líquido "verde tóxico", con siete secciones de contenido que scrollean alrededor de un modelo 3D controlado por el progreso del scroll, tema claro/oscuro y animaciones de entrada del DOM.

**Autoría:** el workshop en sí —el concepto, los prompts, las docs, el contenido y las decisiones de arquitectura— lo hice **yo** ([@juliannichollsc](https://github.com/juliannichollsc)). Los **agentes y skills** que Claude Code carga por el camino son **de terceros**. La gracia del experimento es ver hasta dónde llega *el vibecoding con Claude* cuando lo guías con buena documentación y lo dejas orquestar subagentes especializados.

---

## Constrúyelo tú mismo — dos prompts, dos sesiones

El workshop está pensado para ejecutarse en **dos pasos**, cada uno en una sesión nueva de Claude Code. Todo lo que Claude necesita vive en `docs/`.

### Paso 1 — `docs/PROMPT-1-PROYECTO-BASE.md`

Construye el **andamio** y **una sola vista funcionando: el hero**.

- Vite + React 19 + TypeScript + Tailwind v4
- Todas las dependencias instaladas con **pnpm** (obligatorio) y los peers fijados para React 19
- Estructura de carpetas, tipos de TypeScript y los placeholders de `canvas/` que solo deben compilar
- La sección hero, implementada de verdad

Criterio de éxito: el hero se ve y el proyecto compila. Esto demuestra que el stack está bien enganchado *antes* de asumir el riesgo de la capa 3D.

### Paso 2 — `docs/PROMPT-2-CONSTRUIR-SPA.md`

Toma lo que dejó el paso 1 y construye **todo lo demás** en una sesión limpia:

- Dos subagentes (`technical-agent`, `qa-agent`, ambos en `sonnet`)
- Skills de terceros instaladas y fijadas en `skills-lock.json`
- La escena 3D animada (icosaedro procedural, bloom, rotación por scroll)
- Tema claro/oscuro
- Las siete secciones de contenido sobre Claude Code

La sesión principal de Claude **orquesta directamente**: descompone la tarea, delega lo técnico al `technical-agent`, hace que el `qa-agent` verifique, y todo lo visual lo hace ella misma. No hay agente orchestrator ni `ui-agent` — el porqué está en [`CLAUDE.md`](./CLAUDE.md).

---

## Presentación y material de referencia (`docs/`)

| Archivo | Qué es |
|---|---|
| `docs/presentacion-workshop.html` | La **presentación del workshop** — ábrela en el navegador |
| `docs/CONTENIDO-CLAUDE.md` | Fuente de verdad del **texto** de la SPA sobre Claude Code, y los errores de datos ya detectados |
| `docs/ANIMACION-3D.md` | La escena 3D y las tres trampas de arquitectura (shader dentro del Canvas, `pages` medido, nada de ScrollTrigger) |
| `docs/testing-background.md` | El shader del fondo y sus presets |
| `docs/PROMPT-1-*` / `docs/PROMPT-2-*` | Los dos prompts de construcción descritos arriba |

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **@react-three/fiber** + **@react-three/drei** para 3D
- **@react-three/postprocessing** para el Bloom
- **Tailwind CSS v4**
- **GSAP** + **@gsap/react** para las animaciones de entrada del DOM (disparadas por `IntersectionObserver`, nunca ScrollTrigger)
- **Lenis** para smooth scroll

### La arquitectura de un tirón

El `<Canvas>` ocupa el viewport completo, fijo, en `z-index: 0`. Las secciones HTML se renderizan dentro de `<Scroll html>` de drei. Un icosaedro wireframe procedural permanece centrado y rota en su eje X al scrollear, mientras el contenido scrollea a su alrededor. El contenido está tipado e importado desde `src/data/cv.ts` — cero texto hardcodeado en los componentes.

---

## Correr en local

**pnpm es obligatorio** — nunca npm ni yarn.

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # tsc -b && vite build
pnpm preview
```

---

## Licencia y créditos

Concepto del workshop, prompts, docs y contenido por [@juliannichollsc](https://github.com/juliannichollsc). Construido como experimento de vibecoding con **Claude Code**. Los agentes y skills cargados durante la construcción son herramientas de terceros y pertenecen a sus respectivos autores.
