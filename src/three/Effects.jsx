import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
  SMAA,
} from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber'
import { useStore } from '../lib/store'
import CAMERAS from './cameraConfig'

export default function Effects() {
  const quality = useStore((s) => s.quality)
  const scene = useStore((s) => s.scene)
  const { size } = useThree()

  const cfg = CAMERAS[scene] || CAMERAS.gift
  const narrow = Math.min(1, Math.max(0, (1.15 - size.width / Math.max(1, size.height)) / 0.55))
  const focus = cfg.dist * (1 + (cfg.narrowBoost || 0) * narrow)

  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom
        intensity={quality === 'low' ? 0.5 : 0.78}
        luminanceThreshold={0.66}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.22} darkness={0.62} />
      {quality === 'high' ? (
        <DepthOfField
          focusDistance={focus}
          focusRange={Math.max(4, focus * 0.55)}
          bokehScale={1.4}
          height={720}
        />
      ) : null}
      {quality !== 'low' ? <SMAA /> : null}
    </EffectComposer>
  )
}
