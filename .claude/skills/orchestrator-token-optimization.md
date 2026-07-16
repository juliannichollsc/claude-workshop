---
name: orchestrator-token-optimization
description: |
  Reglas de producción para orquestar subagentes sin desperdiciar tokens.
  Cubre cuándo clonar contexto (fork) vs cuándo lanzar un agente limpio,
  cómo redactar el prompt que recibe un subagente, y cómo mantener memoria
  entre agentes sin re-pagar el historial completo en cada llamada.
  Use this skill when vayas a delegar trabajo a un subagente (technical-agent,
  ui-agent, qa-agent) o a decidir si una tarea de investigación/verificación
  necesita su propio contexto o puede resolverse con una tool directa.
---

# Orquestación económica en tokens

## La regla que más dinero cuesta violar

**Un fork clona toda la conversación acumulada hasta ese punto** — todo lo leído, todo lo editado, cada tool call previo — y ese historial completo se factura como tokens de entrada del subagente nuevo, sin importar cuán chica sea su tarea real. Un fork de 3 búsquedas web puede costar 200k+ tokens no por la investigación, sino por el "clonado" de la sesión.

**Regla dura: NUNCA forkear para una tarea que el orquestador puede resolver con una tool directa** (WebSearch, WebFetch, Read, Grep puntual). Fork solo cuando el *output* de la tarea es ruidoso (mucho texto intermedio que no quieres en tu propio contexto) Y la tarea es genuinamente grande.

## Subagente limpio, no clonado

Los subagentes de este proyecto (`technical-agent`, `ui-agent`, `qa-agent`) **no heredan la conversación del orquestador**. Cada uno arranca con:
1. Su propio system prompt (el `.md` en `.claude/agents/`)
2. **Únicamente el prompt que el orquestador le pasa explícitamente** — no el historial completo de la sesión

Por eso el prompt que le escribes a un subagente debe ser autocontenido:
- Qué archivos tocar (rutas exactas)
- Qué debe lograr, en términos verificables
- Qué NO debe tocar (límites de responsabilidad)
- Qué necesita saber del resto del proyecto que NO puede inferir solo (ej. "el modelo carga desde `public/models/character.glb`")

Si el subagente necesita contexto que no le diste, su primer movimiento debe ser leer los archivos relevantes él mismo (`Read`, `Grep`) — no asumir que "ya lo sabe" porque tú lo sabes.

## Checklist antes de delegar

- [ ] ¿Esta tarea realmente necesita una ventana de contexto aislada, o la resuelvo yo con una tool directa en 1-2 llamadas?
- [ ] Si delega: ¿el prompt que le paso es autosuficiente, o asumí contexto que el subagente no tiene?
- [ ] ¿Le pedí exactamente lo que necesito de vuelta (formato, archivos modificados, resultado de verificación), o va a devolver ruido?
- [ ] ¿El subagente corre en el modelo correcto para su tarea? (`sonnet` para trabajo mecánico/implementación; reservar el modelo de la sesión principal — normalmente más caro — para decisiones de arquitectura y resolución de conflictos entre agentes)

## Memoria entre agentes sin re-pagar contexto

- El **orquestador** (la sesión principal) es la única memoria persistente entre pasos — los subagentes son efímeros y no recuerdan llamadas anteriores.
- No le reenvíes a un subagente la salida completa de otro subagente "por si acaso". Extrae solo el dato que realmente necesita (ej. "el technical-agent ya expone `cvData` desde `src/data/cv.ts` con esta forma: `{...}`" en vez de pegarle el archivo entero).
- Si dos subagentes necesitan el mismo contexto pesado (ej. un archivo grande), que cada uno lo lea directamente con `Read`/`Grep` en vez de que el orquestador lo cargue en su propio contexto y lo repita en cada prompt de delegación.

## Cuándo SÍ vale un fork

- Cuando necesitas que algo revise **tu propio razonamiento previo** en esta sesión (auditoría, segunda opinión) y el output no debe volver a tu contexto en crudo.
- Cuando la tarea es abierta y grande (una investigación multi-fuente que generaría demasiado ruido de tools si la hicieras tú mismo en el hilo principal).

Fuera de esos dos casos: tool directa o agente limpio con prompt autocontenido — nunca fork por defecto.

## Error caro y muy fácil de cometer: duplicar el contenido de una skill dentro del prompt de delegación

Caso real de este proyecto: al delegar FASE 1 a `technical-agent`, el orquestador **reescribió a mano** todo el patrón de cámara cinemática (`damp3`), iluminación de 3 puntos reactiva al keyframe, y umbrales de bloom — contenido que ya vive completo en `.claude/skills/scroll-sequence-keyframes.md`. Eso paga el mismo conocimiento dos veces:
1. Una vez al escribir la skill (ya es un costo hundido, correcto).
2. Otra vez al copiarlo dentro del prompt de cada agente que la necesita — costo evitable, y se repite en cada delegación futura que toque ese mismo patrón.

**Regla: si existe una skill que documenta el patrón, referenciarla por nombre en el prompt — no reescribir su contenido.** El subagente la lee él mismo cuando la invoca (progressive disclosure: el cuerpo de la skill solo entra a su contexto si la usa, y solo una vez).

Antes (caro):
> "Configura CameraRig.tsx: usa `easing.damp3` de maath para posición/target de cámara siguiendo el keyframe interpolado por `useSequence()`, smoothTime ≈ 0.2, más desplazamiento sutil por mouse... [200+ palabras repitiendo el patrón completo]"

Después (barato):
> "Configura CameraRig.tsx. Para el patrón de cámara cinemática, iluminación reactiva y bloom, usa la skill `scroll-sequence-keyframes` (`.claude/skills/`) — ya documenta `damp3`, key/fill/rim light y los thresholds de Bloom exactos."

Esto aplica a cualquier conocimiento reusable: si ya se escribió una vez en una skill, un CLAUDE.md, o un `.claude/agents/*.md`, el prompt de delegación apunta a la fuente — no la clona. Clonar contenido de skills en prompts de delegación es la versión "pequeña" del mismo error que el fork completo: pagar dos veces por lo mismo, solo que a menor escala por cada llamada, así que se acumula rápido con delegaciones repetidas.
