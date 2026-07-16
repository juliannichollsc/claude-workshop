export type Vec3 = [number, number, number]

/** Un keyframe = el estado de la escena cuando una sección está centrada. */
export interface SequenceKeyframe {
  /** id de la sección a la que corresponde este keyframe */
  id: string
  /** posición de la cámara en este punto de la secuencia */
  cameraPosition: Vec3
  /** punto al que mira la cámara */
  cameraTarget: Vec3
  /** rotación acumulada del modelo, en radianes */
  modelRotation: Vec3
  /** posición del modelo; normalmente solo varía en Y */
  modelPosition: Vec3
  /** intensidad del bloom en este punto (0 = apagado) */
  bloomIntensity: number
  /** color de acento del ambiente, en hex */
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
