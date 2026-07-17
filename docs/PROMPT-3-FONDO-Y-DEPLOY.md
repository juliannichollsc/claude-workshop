# PROMPT 3 — Arreglar el fondo shader y desplegar

Toma el proyecto que dejó `PROMPT-2-CONSTRUIR-SPA.md` —escena 3D, tema y las 7 secciones, todo funcionando salvo el fondo— y ciérralo en tres tareas:

1. Haz que el fondo shader se vea.
2. Pregúntale al usuario qué colores quiere y aplícalos.
3. Despliega a Vercel en preview.

Este es el **paso 3 de 3**, y se ejecuta en **sesión nueva y limpia**: no asumas contexto de las sesiones anteriores. Todo lo que necesitas está aquí y en `docs/ANIMACION-3D.md` §8.

**`pnpm` obligatorio.** Nunca `npm`/`npx` en este proyecto.

---

## TAREA 1 — Arreglar el fondo

**El síntoma:** el núcleo wireframe flota sobre un vacío liso del color de `--color-bg`. El fondo shader no aparece por ningún lado.

**No lo diagnostiques desde cero. No es CSS.** No hay z-index mal, ni overlay opaco, ni canvas sin tamaño: `ToxicBackdrop.tsx` está creado y montado dentro del `<Canvas>` fuera del `<Suspense>`, y eso es correcto. Lo que falla es que **el shader no compila**, así que la malla existe y no dibuja nada. Confírmalo en la consola del navegador: verás `THREE.WebGLProgram: Shader Error` con `'#version' : must occur before anything else`.

Delega a **technical-agent**. Solo se toca `src/components/canvas/ToxicBackdrop.tsx`, y son dos arreglos.

### Arreglo 1 — Una sola directiva `#version`

`RawShaderMaterial` + `glslVersion={GLSL3}` hace que three antepone la directiva **él mismo**:

```js
// three/build/three.cjs
let versionString = parameters.glslVersion ? '#version ' + parameters.glslVersion + '\n' : '';
const vertexGlsl = versionString + prefixVertex + vertexShader;   // ← concatena
```

Como el shader que viene de `AnimatedBackground.tsx` ya abre con `#version 300 es` (nació para un contexto WebGL2 propio), el fuente final tiene **dos**. GLSL exige que sea lo primero del archivo. Quita la directiva del fuente y deja que la ponga three:

```tsx
const VERTEX_SHADER = `precision highp float;
in vec3 position;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

// three antepone "#version 300 es" por glslVersion={GLSL3}; hay que quitarlo del fuente
// para no duplicarlo.
const FRAG = FRAGMENT_SHADER.replace('#version 300 es\n', '')
```

**Mantén `glslVersion={GLSL3}`.** El shader usa `in`/`out` y `fragColor`, sintaxis de GLSL ES 3.00. Y no caigas en "lo quito y ya": sin él three no antepone nada, pero `prefixVertex` sigue metiendo sus `#define` **antes** de tu `#version`. Mismo error.

### Arreglo 2 — `frustumCulled={false}` en la malla

```tsx
<mesh frustumCulled={false} renderOrder={-1}>
```

El vertex shader emite los vértices ya en clip-space e ignora la cámara, pero three no lo sabe: calcula el culling contra la bounding sphere del `planeGeometry [2,2]`, que está en el origen. Cuando `CameraRig` mueve la cámara con el scroll, three decide que el plano salió de cuadro y deja de dibujarlo — el fondo desaparece a media página. Intermitente, y por eso peor de diagnosticar que el arreglo 1.

**No toques nada más.** `depthTest={false}`, `depthWrite={false}`, `toneMapped={false}`, `renderOrder={-1}`, los uniforms mutados en `useFrame` y el cross-fade de tema ya están bien.

---

## TAREA 2 — Pedir los colores al usuario

Con el fondo ya visible, **pregunta antes de tocar los presets**. Usa `AskUserQuestion`: ofrece los presets que ya existen en `AnimatedBackground.tsx` —`Toxic` (verde neón, el actual), `Aurora` (magenta), `Oceanic` (cian), `Amber` (naranja), `Ghost` (gris)— y acepta hex propios si prefiere otra cosa.

Al aplicar la respuesta, tres reglas:

1. **El par dark/light comparte geometría.** `THEME_PRESET = { dark: 'Toxic', light: 'Solar' }`, y `Solar` es el gemelo claro de `Toxic`: **idénticos** `rotation`, `proportion`, `scale`, `speed`, `distortion`, `swirl`, `swirlIterations`, `softness`, `offset`, `shape`, `shapeSize`. Solo cambian `color1/2/3`. Así el toggle es un cross-fade y no una deformación del patrón. Si cambias geometría, cámbiala en los dos.
2. **Los colores viven en dos sitios y deben coincidir.** Los presets de `AnimatedBackground.tsx` pintan el shader; las variables de `src/styles/index.css` (`--color-bg`, `--color-accent`, `--color-surface`, `--color-border`…) pintan el DOM. `color1` del preset debe ser el mismo hex que `--color-bg` de ese tema, o el HTML queda de un color y el fondo de otro.
3. **Verifica contraste.** El texto va encima del shader. Si el usuario pide paleta propia, carga la skill `color-theory` y comprueba que `--color-text` se lee sobre `color1`/`color2`.

---

## TAREA 3 — Desplegar a Vercel

Usa la skill **`deploy-to-vercel`**. Está en `skills-lock.json` y en `.agents/skills/deploy-to-vercel/`, pero puede **faltarle el symlink en `.claude/skills/`** — compruébalo y créalo, o la skill no carga.

Despliega a **preview**, nunca a producción salvo que el usuario lo pida: es el default de la propia skill.

**Estos pasos los hace el usuario, no tú** — son los que quiere explicar en vivo:

- **`vercel login`** — interactivo, abre el navegador. Pídele que lo corra él con `! vercel login` y espera.
- **Elegir scope/team** — si tiene varios, lístalos y que elija. No adivines.
- **Crear/linkear el proyecto** — confirma nombre y team antes.
- **Cualquier `git push`** — nunca sin aprobación explícita.
- **Instalar la CLI si falta** — dile que corra `pnpm add -g vercel`; no la instales tú por sorpresa.

El proyecto es un **SPA de Vite**: Vercel detecta el framework solo, `pnpm build` → `dist/`. No hace falta `vercel.json` ni variables de entorno — no hay backend ni secretos. Si algo pide configuración extra, sospecha antes de añadirla.

---

## Verificación

```bash
pnpm build      # sin errores de TypeScript
pnpm dev
```

En el navegador:

- [ ] **El fondo shader se ve**, respirando detrás del núcleo, ya durante la carga.
- [ ] **Consola sin `THREE.WebGLProgram: Shader Error`.** Si sale `'#version' : must occur before anything else`, la directiva sigue duplicada → arreglo 1.
- [ ] **El fondo sigue ahí al scrollear hasta la última sección.** Si desaparece a mitad, cuando la cámara viaja → falta `frustumCulled={false}`, arreglo 2.
- [ ] El theme toggle cruza los colores en ~0.7 s **sin deformar el patrón**. Si el patrón salta o se retuerce → los presets dark/light no comparten geometría, TAREA 2 regla 1.
- [ ] El fondo y el HTML son la misma paleta → TAREA 2 regla 2.
- [ ] El texto del hero se lee sobre el fondo.
- [ ] La URL de preview carga y se ve **igual que en local**.

---

## Fuera de alcance

**No modifiques `PROMPT-1-PROYECTO-BASE.md` ni `PROMPT-2-CONSTRUIR-SPA.md`.** Este prompt es aditivo: parte de lo que ellos dejan.

No rehagas `ToxicBackdrop` desde cero — son dos líneas. No lo saques del `<Canvas>` a un `<canvas>` propio (`ANIMACION-3D.md` §8: el post-procesado le roba el contexto y queda negro). No montes el componente por defecto de `AnimatedBackground` — sigue siendo solo la fuente de `presets`, `FRAGMENT_SHADER`, `PatternShapes`, `hexToRgba` y `THEME_PRESET`. No reintroduzcas el `ui-agent`, ni ScrollTrigger, ni un `.glb`. No despliegues a producción sin que el usuario lo pida.
