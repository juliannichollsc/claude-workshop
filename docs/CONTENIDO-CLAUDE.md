# CONTENIDO — Claude como developer

> Fuente de verdad del **texto** del SPA. El objetivo: presentar a **Claude Code como agente de desarrollo**, con información que le aporte valor real a un developer — no un CV de persona, no una agenda de workshop. Todo el contenido vive en `src/data/cv.ts` y se importa; **cero texto hardcodeado en componentes**.
>
> Son **7 secciones**, una por keyframe de `src/config/sequence.ts` (ver `ANIMACION-3D.md`). El orden de las secciones en `App.tsx` debe coincidir con el de `SEQUENCE`: `useSequence` interpola **por índice**, no por `id`.

## Tono y estándar

- Voz de **senior developer**: preciso, concreto, sin marketing vacío. Frases cortas, verbos fuertes.
- Cada dato debe ser **útil y verdadero**. Nada de porcentajes inventados ni claims que no se sostienen.
- **Verificar antes de publicar.** Los modelos y sus capacidades cambian. Antes de tocar la sección "Modelos", carga la skill `claude-api` y confirma line-up, ventanas de contexto y niveles de `effort`. No escribas de memoria.

### Errores que ya se cometieron aquí — no los repitas

Una versión previa de este documento afirmaba cosas falsas. Quedan anotadas porque son el tipo de error que se cuela:

| Afirmación vieja | Por qué estaba mal |
|---|---|
| `Fable 5` — "modelo de la familia Claude 5 para su nicho", badge `specialized` | Fable 5 es el **modelo más capaz** de Anthropic, por encima de Opus. No es de nicho. |
| Ventana `1M` presentada como universal | **Haiku 4.5 tiene 200K.** Es la excepción y hay que decirlo. |
| `effort`: `low`/`medium`/`high`/`max`, default `medium` | Son **cinco** niveles: falta `xhigh`, y el default es `high`. |
| `~4` caracteres por token | Heurística de **inglés**. En español el ratio es peor. En una charla en español, es un dato erróneo. |
| "Lost in the Middle" como limitación de Claude | Es un hallazgo sobre LLMs en general, no una limitación documentada de Claude. |
| `.claude/rules/` con patrones glob | No está documentado. No enseñes rutas de config que no puedes verificar. |

---

## Sección 1 — HERO (keyframe `hero`)

- **Eyebrow (mono):** `AI CODING AGENT`
- **Título (display, gradient + glow):** `Claude Code`
- **Subtítulo:** `El agente que escribe, ejecuta y verifica código`
- **Tagline:** `Vive en tu terminal: lee tu codebase, edita múltiples archivos, corre los tests y cierra el loop hasta que compila — no solo sugiere, actúa.`
- **Chips meta (mono):** `PLAN → ACT → OBSERVE → CORRECT` · `CONTEXTO 1M TOKENS` · `TERMINAL · IDE · WEB`

---

## Sección 2 — CAPACIDADES (keyframe `skills`)

- **Eyebrow:** `LO QUE HACE` · **Título:** `Capacidades de ingeniería`
- **Subtítulo:** `Un LLM predice texto. Un agente cierra el loop con herramientas.`

Cuatro cards, dos columnas en `md`:

**El loop**
- `Loop agéntico` — Planifica, ejecuta una herramienta, observa y corrige. Itera hasta terminar.
- `stop_reason es el motor` — Si vale `tool_use`, ejecutas la herramienta y devuelves el resultado. Si vale `end_turn`, el bucle termina.

**Herramientas**
- `Tool use sobre el filesystem` — Read, Write, Edit, Bash, Grep, Glob: lee, escribe y ejecuta de verdad.
- `Ejecuta y depura` — Corre `build`/`tests`, lee el error y corrige.

**Codebase**
- `Contexto largo` — Entiende repos enteros con una ventana de hasta 1M de tokens.
- `Ediciones multi-archivo` — Cambios coherentes entre archivos, no parches sueltos.

**Salida fiable**
- `JSON Schema con strict` — Una herramienta con esquema estricto valida la salida exacta. Es la vía fiable, no pedir JSON en el prompt.
- `Few-shot` — De 2 a 4 ejemplos concretos: lo más efectivo para consistencia en extracción.

> `Git y PRs` y `Razonamiento ajustable` se retiraron: el primero es obvio para la audiencia, el segundo duplica la sección de effort.

---

## Sección 3 — MODELOS & EFFORT (keyframe `frameworks`)

- **Eyebrow:** `EL CEREBRO` · **Título:** `Elige modelo y cuánto piensa`
- **Subtítulo:** `Dos perillas que definen costo, velocidad y profundidad.`

**Modelos** — el badge codifica capacidad; `frontier` es el único de relleno sólido y la intensidad baja hasta `fast`. Cada uno muestra su ventana, que es el dato que hace elegir.

| Modelo | Tier | Ctx | Para |
|---|---|---|---|
| `Fable 5` | `frontier` | 1M | El modelo más capaz. Razonamiento siempre activo, para lo más difícil. |
| `Opus 4.8` | `flagship` | 1M | Trabajo agéntico de horizonte largo, arquitectura, orquestación. |
| `Sonnet 5` | `balanced` | 1M | Implementación diaria — el caballo de batalla. |
| `Haiku 4.5` | `fast` | 200K | Tareas mecánicas y de alto volumen, baja latencia. |

**Effort** — cinco niveles, el default es `high`. La barra se rellena de 1 a 5.

| Nivel | Cuándo |
|---|---|
| `low` | Renombrar, formatear, mover. |
| `medium` | Recorta tokens sacrificando profundidad. |
| `high` | El default. Trabajo sensible a inteligencia. |
| `xhigh` | Coding y agéntico — el mejor punto. |
| `max` | Cuando importa más acertar que el costo. |

- **Caption:** `Anti-patrón: max effort para todo. Más effort no es más precisión — en lo trivial, sobrepiensa.`

---

## Sección 4 — CONTEXTO & TOKENS (keyframe `languages`)

- **Eyebrow:** `MEMORIA DE TRABAJO` · **Título:** `El contexto es finito, volátil y costoso`
- **Subtítulo:** `Todo lo que el modelo ve en un turno vive en la ventana de contexto.`

**Métricas (número display + label):**
- `1M` — tokens de ventana en Fable 5, Opus 4.8 y Sonnet 5.
- `200K` — la ventana de Haiku 4.5 — la excepción.
- `5 min` — TTL del prompt cache (hay uno de 1 h opcional).

**Reglas de context engineering:**
- `CLAUDE.md` entra en cada turno — corto, imperativo, sin relleno.
- `/clear` entre tareas independientes; `/compact` cuando la ventana se llena.
- Delega a subagentes: cada uno explora en su propia ventana.
- Carga bajo demanda: las skills entran solo cuando aplican.
- El cache es un **prefijo**: un byte que cambie al inicio lo invalida entero.

---

## Sección 5 — EXTENDER EL AGENTE (keyframe `extend`)

> Sección nueva. MCP, Skills y subagentes estaban enterrados como bullets de una línea dentro de "Orquestación" — siendo el tema del workshop.

- **Eyebrow:** `EXTENDER EL AGENTE` · **Título:** `MCP, Skills, subagentes y hooks`
- **Subtítulo:** `Las cuatro piezas con las que Claude deja de ser genérico.`

Cuatro cards, cada una con un chip mono (`hint`) que dice **dónde vive**:

| Pieza | Hint | Idea |
|---|---|---|
| `MCP` | `.mcp.json` | Estándar abierto para conectar Claude a datos y herramientas externas. Un servidor expone *tools* (acciones) y *resources* (catálogos). A nivel proyecto se versiona con el repo. |
| `Skills` | `SKILL.md` | Carpetas que enseñan un flujo sin repetirlo en cada chat. **Progressive disclosure:** primero lee la descripción, luego el body, y solo toca `references/` si la tarea lo pide. |
| `Subagentes` | `contexto aislado` | El coordinador descompone y delega. Cada subagente arranca con su propia ventana y **no hereda el historial**. |
| `Hooks` | `PostToolUse` | Una instrucción de prompt es probabilística y puede fallar. Para reglas críticas, un hook lo ejecuta el harness, no el modelo. Eso sí es determinista. |

- **Caption:** `La descripción de una herramienta es lo que decide si Claude la elige bien: di cuándo llamarla, no solo qué hace.`

---

## Sección 6 — CÓMO TRABAJA (keyframe `experience`)

- **Eyebrow:** `EL LOOP EN VIVO` · **Título:** `Cómo trabaja Claude Code`
- **Subtítulo:** `Orquestación real: no adivina, itera y verifica.`

Timeline vertical, nodo con número y glow:

1. `Contexto` — Lee tu prompt, `CLAUDE.md`, archivos y salidas previas.
2. `Plan` — Descompone el objetivo y elige la siguiente herramienta.
3. `Acción` — Edita archivos, corre comandos, lanza subagentes.
4. `Observación` — El resultado —incluido el error— vuelve al contexto.
5. `Verificación` — No para en “compila”: confirma que funciona end-to-end.

- **Caption:** `Un error de compilación no es un fracaso: es la observación que cierra el ciclo.`

---

## Sección 7 — FAQ (keyframe `faq`)

> Cierre accionable. Cuatro decisiones que un dev toma el lunes, más un enlace a la documentación.

- **Eyebrow:** `EL LUNES POR LA MAÑANA` · **Título:** `Cuatro decisiones que vas a tomar`
- **Subtítulo:** `Lo que preguntan los devs cuando lo bajan a producción.`

| Pregunta | Respuesta |
|---|---|
| ¿Cómo evito que Claude cuelgue mi pipeline de CI? | Con el flag `-p` (o `--print`): modo no interactivo, termina en vez de esperar input. |
| ¿Plan Mode o ejecución directa? | Plan Mode para lo que tiene implicaciones arquitectónicas o toca varios archivos. Directa para bugs puntuales y bien definidos. |
| ¿Por qué elige la herramienta equivocada? | Porque las descripciones son mínimas o se solapan. Expándelas con formatos de entrada, límites y —sobre todo— **cuándo** llamarlas. |
| ¿Cómo ahorro en análisis masivos? | **Message Batches API**: 50% de descuento para cargas tolerantes a latencia. La mayoría termina en menos de 1 h; el techo es 24 h. |

CTA final: enlace a `links.docs` (`https://docs.claude.com/claude-code`).

---

## Modelo de datos

El contenido vive en `src/data/cv.ts` como `content` (`as const satisfies Content`) y los tipos en `src/types/cv.ts`. El objeto tiene exactamente estas claves: `hero`, `capabilities`, `models`, `context`, `extend`, `howItWorks`, `faq`, `links`.

Dos tipos merecen atención porque codifican decisiones, no solo forma:

```ts
/** `frontier` = el más capaz de la familia (Fable 5), por encima del tier flagship. */
export type ModelTier = 'frontier' | 'flagship' | 'balanced' | 'fast'

/** Niveles reales de `output_config.effort`. El default es `high`. */
export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max'
```

El código exacto está en el repo. Si cambias una sección aquí, cambia `src/types/cv.ts` y `src/data/cv.ts` a la vez — `satisfies Content` hace que el build falle si divergen, que es justo lo que quieres.
