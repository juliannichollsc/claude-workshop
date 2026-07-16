import { SEQUENCE } from '../config/sequence'
import type { SequenceState } from '../types/sequence'
import { useScrollProgress } from './useScrollProgress'

/**
 * Traduce el progreso de scroll (0..1) al par de keyframes de SEQUENCE que
 * están activos ahora mismo, más el progreso local `t` entre ellos.
 * Los campos numéricos de cada keyframe (posición de cámara, color, bloom...)
 * se interpolan manualmente en cada consumidor usando SEQUENCE[from]/SEQUENCE[to]/t.
 */
export function useSequence(): SequenceState {
  const progress = useScrollProgress()
  const lastIndex = SEQUENCE.length - 1

  const clamped = Math.min(Math.max(progress, 0), 1)
  const scaled = clamped * lastIndex

  const from = Math.min(Math.floor(scaled), Math.max(lastIndex - 1, 0))
  const to = Math.min(from + 1, lastIndex)
  const t = scaled - from

  return { progress: clamped, from, to, t }
}
