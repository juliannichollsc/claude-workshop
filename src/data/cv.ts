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

  capabilities: {
    eyebrow: 'LO QUE HACE',
    title: 'Capacidades de ingeniería',
    subtitle: 'Un LLM predice texto. Un agente cierra el loop con herramientas.',
    groups: [
      {
        label: 'El loop',
        items: [
          { name: 'Loop agéntico', desc: 'Planifica, ejecuta una herramienta, observa y corrige. Itera hasta terminar.' },
          {
            name: 'stop_reason es el motor',
            desc: 'Si vale tool_use, ejecutas la herramienta y devuelves el resultado. Si vale end_turn, el bucle termina.',
          },
        ],
      },
      {
        label: 'Herramientas',
        items: [
          { name: 'Tool use sobre el filesystem', desc: 'Read, Write, Edit, Bash, Grep, Glob: lee, escribe y ejecuta de verdad.' },
          { name: 'Ejecuta y depura', desc: 'Corre build/tests, lee el error y corrige.' },
        ],
      },
      {
        label: 'Codebase',
        items: [
          { name: 'Contexto largo', desc: 'Entiende repos enteros con una ventana de hasta 1M de tokens.' },
          { name: 'Ediciones multi-archivo', desc: 'Cambios coherentes entre archivos, no parches sueltos.' },
        ],
      },
      {
        label: 'Salida fiable',
        items: [
          {
            name: 'JSON Schema con strict',
            desc: 'Una herramienta con esquema estricto valida la salida exacta. Es la vía fiable, no pedir JSON en el prompt.',
          },
          { name: 'Few-shot', desc: 'De 2 a 4 ejemplos concretos: lo más efectivo para consistencia en extracción.' },
        ],
      },
    ],
  },

  models: {
    eyebrow: 'EL CEREBRO',
    title: 'Elige modelo y cuánto piensa',
    subtitle: 'Dos perillas que definen costo, velocidad y profundidad.',
    tiers: [
      {
        name: 'Fable 5',
        tier: 'frontier',
        context: '1M',
        for: 'El modelo más capaz. Razonamiento siempre activo, para lo más difícil.',
      },
      {
        name: 'Opus 4.8',
        tier: 'flagship',
        context: '1M',
        for: 'Trabajo agéntico de horizonte largo, arquitectura, orquestación.',
      },
      { name: 'Sonnet 5', tier: 'balanced', context: '1M', for: 'Implementación diaria — el caballo de batalla.' },
      { name: 'Haiku 4.5', tier: 'fast', context: '200K', for: 'Tareas mecánicas y de alto volumen, baja latencia.' },
    ],
    effort: [
      { level: 'low', when: 'Renombrar, formatear, mover.' },
      { level: 'medium', when: 'Recorta tokens sacrificando profundidad.' },
      { level: 'high', when: 'El default. Trabajo sensible a inteligencia.' },
      { level: 'xhigh', when: 'Coding y agéntico — el mejor punto.' },
      { level: 'max', when: 'Cuando importa más acertar que el costo.' },
    ],
    caption: 'Anti-patrón: max effort para todo. Más effort no es más precisión — en lo trivial, sobrepiensa.',
  },

  context: {
    eyebrow: 'MEMORIA DE TRABAJO',
    title: 'El contexto es finito, volátil y costoso',
    subtitle: 'Todo lo que el modelo ve en un turno vive en la ventana de contexto.',
    metrics: [
      { value: '1M', label: 'tokens de ventana en Fable 5, Opus 4.8 y Sonnet 5' },
      { value: '200K', label: 'la ventana de Haiku 4.5 — la excepción' },
      { value: '5 min', label: 'TTL del prompt cache (hay uno de 1 h opcional)' },
    ],
    rules: [
      'CLAUDE.md entra en cada turno — corto, imperativo, sin relleno.',
      '/clear entre tareas independientes; /compact cuando la ventana se llena.',
      'Delega a subagentes: cada uno explora en su propia ventana.',
      'Carga bajo demanda: las skills entran solo cuando aplican.',
      'El cache es un prefijo: un byte que cambie al inicio lo invalida entero.',
    ],
  },

  extend: {
    eyebrow: 'EXTENDER EL AGENTE',
    title: 'MCP, Skills, subagentes y hooks',
    subtitle: 'Las cuatro piezas con las que Claude deja de ser genérico.',
    items: [
      {
        name: 'MCP',
        hint: '.mcp.json',
        desc: 'Estándar abierto para conectar Claude a datos y herramientas externas. Un servidor expone tools (acciones) y resources (catálogos). A nivel proyecto se versiona con el repo.',
      },
      {
        name: 'Skills',
        hint: 'SKILL.md',
        desc: 'Carpetas que enseñan un flujo sin repetirlo en cada chat. Progressive disclosure: primero lee la descripción, luego el body, y solo toca references/ si la tarea lo pide.',
      },
      {
        name: 'Subagentes',
        hint: 'contexto aislado',
        desc: 'El coordinador descompone la tarea y delega. Cada subagente arranca con su propia ventana y no hereda el historial — hay que darle el contexto que necesite.',
      },
      {
        name: 'Hooks',
        hint: 'PostToolUse',
        desc: 'Una instrucción de prompt es probabilística y puede fallar. Para reglas de negocio críticas, un hook lo ejecuta el harness, no el modelo. Eso sí es determinista.',
      },
    ],
    caption:
      'La descripción de una herramienta es lo que decide si Claude la elige bien: di cuándo llamarla, no solo qué hace.',
  },

  howItWorks: {
    eyebrow: 'EL LOOP EN VIVO',
    title: 'Cómo trabaja Claude Code',
    subtitle: 'Orquestación real: no adivina, itera y verifica.',
    steps: [
      { n: '01', title: 'Contexto', desc: 'Lee tu prompt, CLAUDE.md, archivos y salidas previas.' },
      { n: '02', title: 'Plan', desc: 'Descompone el objetivo y elige la siguiente herramienta.' },
      { n: '03', title: 'Acción', desc: 'Edita archivos, corre comandos, lanza subagentes.' },
      { n: '04', title: 'Observación', desc: 'El resultado —incluido el error— vuelve al contexto.' },
      { n: '05', title: 'Verificación', desc: 'No para en “compila”: confirma que funciona end-to-end.' },
    ],
    caption: 'Un error de compilación no es un fracaso: es la observación que cierra el ciclo.',
  },

  faq: {
    eyebrow: 'EL LUNES POR LA MAÑANA',
    title: 'Cuatro decisiones que vas a tomar',
    subtitle: 'Lo que preguntan los devs cuando lo bajan a producción.',
    items: [
      {
        q: '¿Cómo evito que Claude cuelgue mi pipeline de CI?',
        a: 'Con el flag -p (o --print): ejecuta Claude Code en modo no interactivo y termina en vez de esperar input.',
      },
      {
        q: '¿Plan Mode o ejecución directa?',
        a: 'Plan Mode para lo que tiene implicaciones arquitectónicas o toca varios archivos. Directa para bugs puntuales y bien definidos.',
      },
      {
        q: '¿Por qué elige la herramienta equivocada?',
        a: 'Porque las descripciones son mínimas o se solapan. Expándelas con formatos de entrada, límites y —sobre todo— cuándo llamarlas.',
      },
      {
        q: '¿Cómo ahorro en análisis masivos?',
        a: 'Message Batches API: 50% de descuento para cargas tolerantes a latencia. La mayoría termina en menos de 1 h; el techo es 24 h.',
      },
    ],
  },

  links: {
    docs: 'https://docs.claude.com/claude-code',
    github: 'https://github.com/anthropics/claude-code',
    site: 'https://claude.com',
  },
} as const satisfies Content
