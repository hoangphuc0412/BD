import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import PetalField from '../objects/PetalField'
import HeartMesh, { Glow } from '../objects/Hearts'
import { useStore } from '../../lib/store'
import { content } from '../../config/content'
import { QUALITY_PRESETS } from '../../lib/quality'
import { captionTexture, glowTexture, placeholderPhotoTexture } from '../../lib/textures'
import { audio } from '../../lib/audio'
import { clickBlocked, pointerState, setCursor } from '../../lib/interact'

const texCache = new Map()
const loader = new THREE.TextureLoader()

function fitCover(t) {
  const img = t.image
  if (!img?.width || !img?.height) return t
  const aspect = img.width / img.height
  if (aspect < 1) {
    t.repeat.set(1, aspect)
    t.offset.set(0, (1 - aspect) / 2)
  } else {
    const sx = 1 / aspect
    t.repeat.set(sx, 1)
    t.offset.set((1 - sx) / 2, 0)
  }
  t.needsUpdate = true
  return t
}

function usePhotoTexture(src, seed) {
  const fallback = useMemo(() => placeholderPhotoTexture(seed), [seed])
  const [tex, setTex] = useState(() => texCache.get(src) || null)

  useEffect(() => {
    if (texCache.has(src)) {
      setTex(texCache.get(src))
      return
    }
    let alive = true
    loader.load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 8
        fitCover(t)
        texCache.set(src, t)
        if (alive) setTex(t)
      },
      undefined,
      () => {},
    )
    return () => {
      alive = false
    }
  }, [src])

  return tex || fallback
}

function Polaroid({ photo, index, position, rotation, scale, onOpen }) {
  const group = useRef()
  const glowRef = useRef()
  const hoverRef = useRef(0)
  const [hovered, setHovered] = useState(false)
  const tex = usePhotoTexture(photo.src, index)
  const cap = useMemo(() => captionTexture(photo.caption, photo.date), [photo.caption, photo.date])
  const phase = index * 1.37

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = group.current
    if (!g) return
    g.position.y = position[1] + Math.sin(t * 0.55 + phase) * 0.13
    g.rotation.y = rotation[1] + pointerState.nx * 0.035 + Math.sin(t * 0.4 + phase) * 0.02
    g.rotation.z = rotation[2] + Math.sin(t * 0.5 + phase * 1.3) * 0.014
    g.rotation.x = rotation[0] + Math.sin(t * 0.32 + phase) * 0.012

    const target = hovered ? 1.1 : 1
    hoverRef.current += (target - hoverRef.current) * 0.12
    g.scale.setScalar(scale * hoverRef.current)

    if (glowRef.current) glowRef.current.material.opacity = (hoverRef.current - 1) * 3.2
  })

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        if (clickBlocked()) return
        setCursor(false)
        audio.sfx('paper')
        onOpen(index)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        setCursor(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
        setCursor(false)
      }}
    >
      <sprite ref={glowRef} position={[0, 0, -0.16]} scale={[4.6, 4.6, 1]}>
        <spriteMaterial
          map={glowTexture()}
          color="#ffa8c4"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <RoundedBox args={[2.7, 3.3, 0.08]} radius={0.05} smoothness={3}>
        <meshPhysicalMaterial color="#fdf7ef" roughness={0.48} metalness={0.02} clearcoat={0.35} clearcoatRoughness={0.5} />
      </RoundedBox>

      <mesh position={[0, 0.3, 0.052]}>
        <planeGeometry args={[2.38, 2.38]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.3, 0.053]}>
        <planeGeometry args={[2.38, 2.38]} />
        <meshBasicMaterial color="#ff9fbb" transparent opacity={0.05} toneMapped={false} />
      </mesh>

      <mesh position={[0, -1.23, 0.052]}>
        <planeGeometry args={[2.36, 0.69]} />
        <meshBasicMaterial map={cap} transparent toneMapped={false} />
      </mesh>

      {/* hanging thread */}
      <mesh position={[0, 1.65 + 1.3, -0.01]}>
        <cylinderGeometry args={[0.005, 0.005, 2.6, 4]} />
        <meshBasicMaterial color="#e4c9a4" transparent opacity={0.28} />
      </mesh>
      <mesh position={[0, 1.65 + 2.58, -0.01]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#e4c9a4" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  )
}

function MemoriesGlow() {
  return (
    <group>
      <Glow color="#c45a84" size={12} opacity={0.05} position={[0, 3.2, -16]} />
      <Glow color="#d9a06a" size={9} opacity={0.035} position={[-8, 5.4, -14]} />
      <Glow color="#9d6ec4" size={10} opacity={0.03} position={[8, 1.5, -14]} />
    </group>
  )
}

function DecorHearts() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.04
  })
  const hearts = [
    [-6.4, 3.2, -1.5, 0.16],
    [6.6, 4.4, -1.2, 0.13],
    [-5.4, 0.4, 2.2, 0.1],
    [5.9, 0.1, 1.8, 0.11],
  ]
  return (
    <group ref={ref}>
      {hearts.map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>
          <HeartMesh scale={1} color="#e97a9c" emissive="#ff3f6b" emissiveIntensity={0.6} halo={2.2} haloOpacity={0.3} />
        </group>
      ))}
    </group>
  )
}

export default function MemoriesScene() {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality]
  const openPhoto = useStore((s) => s.openPhoto)
  const { size } = useThree()
  const narrow = size.width / size.height < 0.95

  const layout = useMemo(() => {
    if (narrow) {
      return [
        { position: [-1.42, 3.6, 0.4], rotation: [0, 0.12, -0.02], scale: 0.7 },
        { position: [1.42, 3.45, 0.9], rotation: [0, -0.1, 0.03], scale: 0.7 },
        { position: [-1.42, 1.5, 1.0], rotation: [0, 0.1, 0.03], scale: 0.7 },
        { position: [1.42, 1.35, 0.5], rotation: [0, -0.12, -0.03], scale: 0.7 },
        { position: [-1.42, -0.6, 0.6], rotation: [0, 0.08, -0.02], scale: 0.7 },
        { position: [1.42, -0.75, 1.1], rotation: [0, -0.08, 0.02], scale: 0.7 },
      ]
    }
    return [
      { position: [-3.05, 2.52, 0.0], rotation: [0, 0.22, -0.04], scale: 0.66 },
      { position: [0, 2.4, 0.35], rotation: [0, -0.02, 0.02], scale: 0.66 },
      { position: [3.05, 2.5, -0.05], rotation: [0, -0.2, 0.04], scale: 0.66 },
      { position: [-3.05, 0.52, 0.4], rotation: [0, 0.18, 0.03], scale: 0.66 },
      { position: [0, 0.66, 0.0], rotation: [0, -0.01, -0.03], scale: 0.66 },
      { position: [3.05, 0.5, 0.35], rotation: [0, -0.16, -0.03], scale: 0.66 },
    ]
  }, [narrow])

  return (
    <group>
      <MemoriesGlow />
      <DecorHearts />

      {content.memories.photos.map((photo, i) => {
        const l = layout[i]
        if (!l) return null
        return (
          <Polaroid
            key={photo.src + i}
            photo={photo}
            index={i}
            position={l.position}
            rotation={l.rotation}
            scale={l.scale}
            onOpen={openPhoto}
          />
        )
      })}

      <PetalField count={Math.round(preset.petals * 0.4)} position={[0, 0, 0]} opacity={0.5} />

      <pointLight position={[-6, 6, 6]} intensity={18} color="#ff9fbe" distance={30} />
      <pointLight position={[7, 3, 4]} intensity={12} color="#ffd2a4" distance={26} />
      <spotLight position={[0, 12, 8]} angle={0.7} penumbra={1} intensity={48} color="#ffe6ef" distance={50} />
      <ambientLight intensity={0.12} color="#ffd9e6" />
    </group>
  )
}
