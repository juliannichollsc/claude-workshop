import type { SequenceKeyframe } from '../types/sequence'

// Paleta "Toxic" (testing-background.md, preset AnimatedGradient): #050d05 / #0a240a / #39ff14
// Una vuelta completa (2π) repartida entre los 7 keyframes: cada sección avanza π/3.
// El orden debe coincidir con el de las secciones en App.tsx — useSequence interpola por índice.
export const SEQUENCE: SequenceKeyframe[] = [
  { id: 'hero',        cameraPosition: [0, 0, 5],    cameraTarget: [0, 0, 0], modelRotation: [0, 0, 0],                   modelPosition: [0, -1, 0],   bloomIntensity: 0.6, accentColor: '#39ff14' },
  { id: 'skills',      cameraPosition: [2, 0.5, 4],  cameraTarget: [0, 0, 0], modelRotation: [Math.PI / 3, 0, 0],         modelPosition: [0, -1, 0],   bloomIntensity: 0.9, accentColor: '#39ff14' },
  { id: 'frameworks',  cameraPosition: [-2, 0.5, 4], cameraTarget: [0, 0, 0], modelRotation: [(Math.PI * 2) / 3, 0, 0],   modelPosition: [0, -1, 0],   bloomIntensity: 1.2, accentColor: '#7cff3d' },
  { id: 'languages',   cameraPosition: [0, 1.5, 3.5],cameraTarget: [0, 0, 0], modelRotation: [Math.PI, 0, 0],             modelPosition: [0, -0.8, 0], bloomIntensity: 0.9, accentColor: '#7cff3d' },
  { id: 'extend',      cameraPosition: [2.2, 1, 4],  cameraTarget: [0, 0, 0], modelRotation: [(Math.PI * 4) / 3, 0, 0],   modelPosition: [0, -0.9, 0], bloomIntensity: 1.1, accentColor: '#7cff3d' },
  { id: 'experience',  cameraPosition: [0, 0, 6],    cameraTarget: [0, 0, 0], modelRotation: [(Math.PI * 5) / 3, 0, 0],   modelPosition: [0, -1, 0],   bloomIntensity: 0.8, accentColor: '#39ff14' },
  { id: 'faq',         cameraPosition: [0, -0.5, 5], cameraTarget: [0, 0, 0], modelRotation: [Math.PI * 2, 0, 0],         modelPosition: [0, -1, 0],   bloomIntensity: 0.6, accentColor: '#39ff14' },
]

/**
 * Valor inicial de `pages` para ScrollControls, antes de medir el contenido real.
 *
 * `pages` NO es "número de secciones": es la altura del spacer en múltiplos del viewport.
 * Las secciones son `min-h-screen`, así que las que llevan más contenido (timeline, FAQ)
 * superan 100vh y el DOM acaba midiendo más que `SEQUENCE.length` viewports — el scroll se
 * cortaba en la última. App mide y corrige; esto es solo el arranque.
 */
export const INITIAL_PAGES = SEQUENCE.length
