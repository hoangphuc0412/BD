import { useMemo } from 'react'
import * as THREE from 'three'
import { shadowTexture } from '../../lib/textures'

export default function SoftShadow({ position = [0, 0.02, 0], scale = [8, 8], opacity = 0.55, ...props }) {
  const tex = useMemo(shadowTexture, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={position} scale={[scale[0], scale[1], 1]} {...props}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={opacity}
        depthWrite={false}
        color="#000000"
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}
