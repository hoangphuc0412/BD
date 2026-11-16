import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createHeartGeometry } from '../geometry'
import { glowTexture } from '../../lib/textures'

export function Glow({ color = '#ff9ebb', size = 3, opacity = 0.55, ...props }) {
  const tex = useMemo(glowTexture, [])
  return (
    <sprite scale={[size, size, 1]} {...props}>
      <spriteMaterial
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

export default function HeartMesh({
  scale = 1,
  color = '#e2648b',
  emissive = '#ff2f63',
  emissiveIntensity = 0.5,
  halo = 1.2,
  haloOpacity = 0.5,
  ...props
}) {
  const geo = useMemo(createHeartGeometry, [])
  return (
    <group {...props}>
      <mesh geometry={geo} scale={scale}>
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.24}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.2}
          sheen={1}
          sheenColor="#ffc2d4"
          sheenRoughness={0.6}
        />
      </mesh>
      {halo > 0 && (
        <Glow color={emissive} size={scale * 2.2 * halo} opacity={haloOpacity} position={[0, 0, -0.25]} />
      )}
    </group>
  )
}

/** A glowing heart that floats and can be clicked. */
export function FloatingHeart({
  position = [0, 3, 0],
  scale = 0.4,
  color,
  emissive,
  speed = 1,
  phase = 0,
  spin = 0.2,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  const ref = useRef()
  const base = useRef(position)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = ref.current
    if (!g) return
    g.position.y = base.current[1] + Math.sin(t * 0.7 * speed + phase) * 0.35
    g.position.x = base.current[0] + Math.cos(t * 0.42 * speed + phase) * 0.18
    g.rotation.y = t * spin + phase
    g.rotation.z = Math.sin(t * 0.5 + phase) * 0.16
    const s = 1 + Math.sin(t * 1.1 + phase) * 0.035
    g.scale.setScalar(s)
  })

  return (
    <group
      ref={ref}
      position={position}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <HeartMesh scale={scale} color={color} emissive={emissive} />
      {/* generous invisible hit area for touch */}
      <mesh visible={false}>
        <sphereGeometry args={[scale * 1.75, 10, 10]} />
        <meshBasicMaterial />
      </mesh>
      <Glow color={emissive || '#ff6f96'} size={scale * 4.2} opacity={0.16} />
    </group>
  )
}
