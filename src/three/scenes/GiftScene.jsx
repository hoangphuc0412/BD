import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import PetalField from '../objects/PetalField'
import HeartMesh, { Glow } from '../objects/Hearts'
import SoftShadow from '../objects/SoftShadow'
import { useStore } from '../../lib/store'
import { QUALITY_PRESETS } from '../../lib/quality'
import { glowTexture, marbleTexture } from '../../lib/textures'

const rand = (a, b) => a + Math.random() * (b - a)

function Ribbon({ width = 0.58, height = 2.46, depth = 3.28, y = 1.2, vertical = true, color = '#e6c9a0' }) {
  return (
    <mesh position={[0, y, 0]}>
      <boxGeometry args={vertical ? [width, height, depth] : [depth, height, width]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.3}
        metalness={0.35}
        clearcoat={0.7}
        clearcoatRoughness={0.35}
        sheen={0.7}
        sheenColor="#fff0d8"
      />
    </mesh>
  )
}

function Bow({ scale = 1 }) {
  return (
    <group scale={scale} position={[0, 0.36, 0]}>
      <mesh rotation={[0, 0, 0.62]} position={[0.44, 0.04, 0]} scale={[1.16, 0.72, 0.52]}>
        <torusGeometry args={[0.34, 0.095, 14, 40]} />
        <meshPhysicalMaterial color="#e8cda6" roughness={0.32} metalness={0.32} clearcoat={0.6} sheen={0.8} sheenColor="#fff1d9" />
      </mesh>
      <mesh rotation={[0, 0, -0.62]} position={[-0.44, 0.04, 0]} scale={[1.16, 0.72, 0.52]}>
        <torusGeometry args={[0.34, 0.095, 14, 40]} />
        <meshPhysicalMaterial color="#e8cda6" roughness={0.32} metalness={0.32} clearcoat={0.6} sheen={0.8} sheenColor="#fff1d9" />
      </mesh>
      <mesh scale={[0.17, 0.15, 0.17]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshPhysicalMaterial color="#f0d6ae" roughness={0.28} metalness={0.35} clearcoat={0.8} />
      </mesh>
      <mesh rotation={[0.35, 0.2, 0.55]} position={[0.38, -0.22, 0.12]}>
        <boxGeometry args={[0.13, 0.55, 0.035]} />
        <meshPhysicalMaterial color="#e8cda6" roughness={0.32} metalness={0.3} />
      </mesh>
      <mesh rotation={[-0.2, -0.1, -0.5]} position={[-0.36, -0.24, -0.05]}>
        <boxGeometry args={[0.13, 0.6, 0.035]} />
        <meshPhysicalMaterial color="#e8cda6" roughness={0.32} metalness={0.3} />
      </mesh>
    </group>
  )
}

function OrbitHearts() {
  const group = useRef()
  const hearts = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        angle: (i / 7) * Math.PI * 2,
        radius: rand(3.2, 4.5),
        y: rand(2.2, 5.4),
        scale: rand(0.1, 0.2),
        phase: rand(0, Math.PI * 2),
      })),
    [],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) group.current.rotation.y = t * 0.055
    group.current?.children.forEach((c, i) => {
      const h = hearts[i]
      c.position.y = h.y + Math.sin(t * 0.5 + h.phase) * 0.35
      c.rotation.z = Math.sin(t * 0.6 + h.phase) * 0.2
    })
  })
  return (
    <group ref={group} position={[0, 0, -2.6]}>
      {hearts.map((h, i) => (
        <group
          key={i}
          position={[Math.cos(h.angle) * h.radius, h.y, Math.sin(h.angle) * h.radius]}
          scale={h.scale}
        >
          <HeartMesh scale={1} color="#ec7396" emissive="#ff3768" emissiveIntensity={0.75} halo={1.5} haloOpacity={0.42} />
        </group>
      ))}
    </group>
  )
}

export default function GiftScene() {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality]
  const giftOpened = useStore((s) => s.giftOpened)
  const setScene = useStore((s) => s.setScene)

  const box = useRef()
  const lid = useRef()
  const innerLight = useRef()
  const topGlow = useRef()
  const beam = useRef()
  const shockwave = useRef()
  const burstRefs = useRef([])
  const switched = useRef(false)
  const opened = useRef(false)

  const marble = useMemo(marbleTexture, [])
  const glow = useMemo(glowTexture, [])

  const burstHearts = useMemo(
    () =>
      Array.from({ length: quality === 'low' ? 8 : 14 }, () => ({
        target: [rand(-5, 5), rand(3.4, 7.4), rand(-5, -1.4)],
        scale: rand(0.1, 0.22),
        delay: rand(0.15, 0.6),
      })),
    [quality],
  )

  useEffect(() => {
    if (box.current) {
      gsap.fromTo(
        box.current.scale,
        { x: 0.82, y: 0.82, z: 0.82 },
        { x: 1, y: 1, z: 1, duration: 1.8, ease: 'elastic.out(1, 0.65)' },
      )
      gsap.fromTo(
        box.current.position,
        { y: -0.4 },
        { y: 0.28, duration: 1.9, ease: 'power3.out' },
      )
    }
  }, [])

  useEffect(() => {
    if (!giftOpened || opened.current) return
    opened.current = true

    const tl = gsap.timeline()
    tl.to(
      lid.current.position,
      { y: 4.9, x: 1.1, z: -0.3, duration: 1.9, ease: 'power3.out' },
      0,
    )
    tl.to(
      lid.current.rotation,
      { x: -0.55, y: 0.45, z: 0.5, duration: 2.1, ease: 'power2.out' },
      0,
    )
    tl.to(
      innerLight.current,
      { intensity: 26, duration: 1.5, ease: 'power2.out' },
      0.25,
    )
    tl.to(
      topGlow.current.scale,
      { x: 9, y: 9, z: 1, duration: 1.6, ease: 'power2.out' },
      0.3,
    )
    tl.to(topGlow.current.material, { opacity: 0.7, duration: 1.2 }, 0.3)
    tl.to(
      beam.current.material,
      { opacity: 0.34, duration: 1.4, ease: 'power2.out' },
      0.35,
    )
    tl.to(beam.current.scale, { x: 1.25, y: 1.15, z: 1.25, duration: 2.2, ease: 'power2.out' }, 0.35)
    tl.to(
      shockwave.current.scale,
      { x: 13, y: 13, z: 13, duration: 1.9, ease: 'power2.out' },
      0.4,
    )
    tl.to(shockwave.current.material, { opacity: 0, duration: 1.7, ease: 'power2.in' }, 0.45)

    burstHearts.forEach((h, i) => {
      const el = burstRefs.current[i]
      if (!el) return
      tl.fromTo(
        el.position,
        { x: 0, y: 2.9, z: 0 },
        { x: h.target[0], y: h.target[1], z: h.target[2], duration: 2.3, ease: 'power3.out' },
        0.45 + h.delay,
      )
      tl.fromTo(
        el.scale,
        { x: 0.001, y: 0.001, z: 0.001 },
        { x: h.scale, y: h.scale, z: h.scale, duration: 1.5, ease: 'back.out(2.4)' },
        0.5 + h.delay,
      )
    })

    if (useStore.getState().visited.garden) return

    const t = setTimeout(() => {
      if (switched.current) return
      switched.current = true
      const s = useStore.getState()
      if (s.scene === 'gift') setScene('garden')
    }, 3600)

    return () => clearTimeout(t)
  }, [giftOpened, burstHearts, setScene])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (beam.current) beam.current.rotation.y = t * 0.18
    if (shockwave.current) shockwave.current.rotation.z = t * 0.3
    if (box.current) {
      box.current.rotation.y = Math.sin(t * 0.16) * 0.08
    }
    burstRefs.current.forEach((el, i) => {
      if (!el) return
      el.rotation.y = t * 0.6 + i
      el.rotation.z = Math.sin(t * 0.8 + i) * 0.25
    })
  })

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]}>
        <circleGeometry args={[70, 64]} />
        <meshStandardMaterial color="#160710" roughness={1} metalness={0} />
      </mesh>

      {/* pedestal */}
      <group>
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[4.4, 4.7, 0.34, 72]} />
          <meshPhysicalMaterial
            map={marble}
            color="#f0dade"
            emissive="#3a1a26"
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.25}
            clearcoat={0.5}
            clearcoatRoughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.26, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[4.42, 0.035, 8, 120]} />
          <meshStandardMaterial color="#d9b98a" metalness={0.9} roughness={0.22} emissive="#6b4a22" emissiveIntensity={0.25} />
        </mesh>
      </group>

      <SoftShadow position={[0, 0.31, 0]} scale={[11, 11]} opacity={0.6} />

      <group ref={box} position={[0, 0.28, 0]}>
        {/* box body */}
        <RoundedBox args={[3.25, 2.4, 3.25]} radius={0.11} smoothness={4} position={[0, 1.2, 0]}>
          <meshPhysicalMaterial
            color="#701c3c"
            roughness={0.55}
            metalness={0.06}
            sheen={1}
            sheenColor="#ffb0c8"
            sheenRoughness={0.42}
            clearcoat={0.4}
            clearcoatRoughness={0.55}
            envMapIntensity={0.5}
          />
        </RoundedBox>
        <Ribbon vertical height={2.46} depth={3.29} />
        <Ribbon vertical={false} height={2.46} depth={3.29} />

        {/* inner glow bed */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 2.41, 0]}>
          <circleGeometry args={[1.5, 48]} />
          <meshBasicMaterial color="#ffd9ad" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <pointLight ref={innerLight} position={[0, 2.7, 0]} color="#ffd9ae" intensity={0} distance={30} decay={2} />
        <sprite ref={topGlow} position={[0, 2.9, 0]} scale={[1.2, 1.2, 1]}>
          <spriteMaterial map={glow} color="#ffd7a8" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>

        {/* lid */}
        <group ref={lid} position={[0, 2.62, 0]}>
          <RoundedBox args={[3.55, 0.44, 3.55]} radius={0.08} smoothness={4}>
            <meshPhysicalMaterial
              color="#7c2144"
              roughness={0.5}
              metalness={0.08}
              sheen={1}
              sheenColor="#ffb8cd"
              sheenRoughness={0.4}
              clearcoat={0.45}
              envMapIntensity={0.55}
            />
          </RoundedBox>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.58, 0.48, 3.6]} />
            <meshPhysicalMaterial color="#e6c9a0" roughness={0.3} metalness={0.35} clearcoat={0.6} sheen={0.7} sheenColor="#fff2dd" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[3.6, 0.48, 0.58]} />
            <meshPhysicalMaterial color="#e6c9a0" roughness={0.3} metalness={0.35} clearcoat={0.6} sheen={0.7} sheenColor="#fff2dd" />
          </mesh>
          <Bow scale={1.05} />
        </group>
      </group>

      {/* cinematic light beam */}
      <mesh ref={beam} position={[0, 6.2, 0]}>
        <cylinderGeometry args={[3.1, 1.3, 7.4, 40, 1, true]} />
        <meshBasicMaterial
          color="#ffd9b0"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={glow}
        />
      </mesh>

      {/* shockwave ring */}
      <mesh ref={shockwave} rotation-x={-Math.PI / 2} position={[0, 0.36, 0]}>
        <ringGeometry args={[0.9, 1.02, 64]} />
        <meshBasicMaterial color="#ffcf9c" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* hearts that fly out of the box */}
      {burstHearts.map((h, i) => (
        <group key={i} ref={(el) => (burstRefs.current[i] = el)} position={[0, 2.9, 0]} scale={0.001}>
          <HeartMesh scale={1} color="#eb6f93" emissive="#ff2f63" emissiveIntensity={0.8} halo={1.8} haloOpacity={0.4} />
        </group>
      ))}

      <OrbitHearts />

      <PetalField
        count={preset.petals}
        position={[0, 0, 0]}
        opacity={0.95}
        speed={0.85}
      />

      {/* rim lights */}
      <pointLight position={[-7, 5, 6]} intensity={22} color="#ff86a8" distance={30} />
      <pointLight position={[7, 4, -4]} intensity={18} color="#ffcf9e" distance={28} />
      <spotLight position={[0, 16, 6]} angle={0.5} penumbra={0.9} intensity={80} color="#ffe4ec" distance={50} />
      <Glow color="#ffb0c4" size={26} opacity={0.1} position={[0, 3.4, -9]} />
    </group>
  )
}
