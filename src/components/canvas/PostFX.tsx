import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useSequence } from '../../hooks/useSequence'
import { SEQUENCE } from '../../config/sequence'

export default function PostFX() {
  const seq = useSequence()
  const from = SEQUENCE[seq.from].bloomIntensity
  const to = SEQUENCE[seq.to].bloomIntensity
  const bloomIntensity = from + (to - from) * seq.t

  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.3} intensity={bloomIntensity} />
    </EffectComposer>
  )
}
