import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import PetalField from '../objects/PetalField'
import { Glow } from '../objects/Hearts'
import SoftShadow from '../objects/SoftShadow'
import { useStore } from '../../lib/store'
import { QUALITY_PRESETS } from '../../lib/quality'
import { glowTexture, paperTexture, petalTexture, sceneBackdropTexture, woodTexture } from '../../lib/textures'
import { audio } from '../../lib/audio'
import { clickBlocked, setCursor } from '../../lib/interact'

function Candle() {
  const flame = useRef()
  const light = useRef()
  const glow = useMemo(glowTexture, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const f = 0.8 + Math.sin(t * 8.4) * 0.09 + Math.sin(t * 15.1 + 1.3) * 0.06
    if (flame.current) {
      flame.current.scale.set(0.5 * (0.95 + f * 0.1), 1.5 * f, 1)
      flame.current.material.opacity = 0.75 + f * 0.2
    }
    if (light.current) light.current.intensity = 9 * f
  })

  return (
    <group position={[-2.9, 0, 0.8]}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.46, 0.52, 0.08, 32]} />
        <meshStandardMaterial color="#c9a36a" metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 0.18, 20]} />
        <meshStandardMaterial color="#d9b98a" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 1.6, 28]} />
        <meshPhysicalMaterial color="#f7e8d6" roughness={0.55} sheen={0.7} sheenColor="#fff3e2" />
      </mesh>
      <mesh position={[0, 1.77, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshStandardMaterial color="#231208" />
      </mesh>
      <sprite ref={flame} position={[0, 1.97, 0]}>
        <spriteMaterial map={glow} color="#ffb766" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[0, 1.97, 0]} scale={[1.5, 2.2, 1]}>
        <spriteMaterial map={glow} color="#ff9d4d" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight ref={light} position={[0, 2.05, 0]} color="#ffb066" intensity={9} distance={14} decay={2} />
    </group>
  )
}

function DeskRose() {
  const petal = useMemo(petalTexture, [])
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.4, 0.06, 2.5),
      new THREE.Vector3(2.8, 0.06, 1.5),
      new THREE.Vector3(2.4, 0.1, 0.3),
      new THREE.Vector3(2.15, 0.32, -0.5),
    ])
  }, [])

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 40, 0.025, 6, false]} />
        <meshStandardMaterial color="#2e4a2c" roughness={0.85} />
      </mesh>
      {[0.28, 0.36, 0.44, 0.52, 0.6, 0.68].map((t, i) => {
        const p = curve.getPoint(t)
        const a = i * 1.7
        return (
          <mesh
            key={i}
            position={[p.x + Math.cos(a) * 0.19, p.y + 0.16 + (i % 2) * 0.05, p.z + Math.sin(a) * 0.19]}
            rotation={[-1.1 + (i % 2) * 0.3, a, a * 0.6]}
            scale={[0.3, 0.36, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              map={petal}
              color={i % 2 ? '#d2446c' : '#ef7c9b'}
              transparent
              alphaTest={0.2}
              side={THREE.DoubleSide}
              roughness={0.65}
              emissive="#e0446b"
              emissiveIntensity={0.12}
            />
          </mesh>
        )
      })}
      <mesh position={[2.2, 0.32, -0.52]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#7c1f3c" roughness={0.6} />
      </mesh>
    </group>
  )
}

function InkWell() {
  return (
    <group position={[2.9, 0, 0.1]}>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.34, 28]} />
        <meshPhysicalMaterial color="#170b12" roughness={0.18} metalness={0.55} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.08, 24]} />
        <meshStandardMaterial color="#c9a36a" metalness={0.9} roughness={0.28} />
      </mesh>
      {/* quill */}
      <group position={[0.34, 0.5, -0.1]} rotation={[0.2, 0, -0.55]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.007, 0.014, 1.8, 5]} />
          <meshStandardMaterial color="#efe1cd" roughness={0.8} />
        </mesh>
        <mesh position={[0.13, 1.25, 0]} rotation={[0, 0, 0.12]} scale={[0.22, 0.85, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color="#fbf0df" side={THREE.DoubleSide} roughness={0.85} transparent opacity={0.92} />
        </mesh>
        <mesh position={[0.17, 0.85, 0]} rotation={[0, 0, 0.1]} scale={[0.2, 0.62, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color="#f3e5d1" side={THREE.DoubleSide} roughness={0.85} transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  )
}

function ScatteredPetals() {
  const tex = useMemo(petalTexture, [])
  const items = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        pos: [Math.random() * 8 - 4, 0.012, Math.random() * 5 - 2.2],
        rot: [-Math.PI / 2 + (Math.random() - 0.5) * 0.12, 0, Math.random() * Math.PI * 2],
        scale: 0.1 + Math.random() * 0.14,
        color: ['#f3b6c8', '#ec93ae', '#d96f92', '#fbe0e7'][Math.floor(Math.random() * 4)],
      })),
    [],
  )
  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos} rotation={it.rot} scale={[it.scale, it.scale, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={tex} color={it.color} transparent alphaTest={0.2} side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export default function LetterScene() {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality]
  const letterOpened = useStore((s) => s.letterOpened)
  const setLetterOpen = useStore((s) => s.setLetterOpen)

  const wood = useMemo(woodTexture, [])
  const paper = useMemo(paperTexture, [])
  const backdrop = useMemo(sceneBackdropTexture, [])
  const flap = useRef()
  const paperRef = useRef()
  const seal = useRef()
  const glowRef = useRef()
  const light = useRef()
  const busy = useRef(false)

  useEffect(() => {
    if (flap.current) flap.current.rotation.x = 0.02
  }, [])

  const openLetter = (e) => {
    e.stopPropagation()
    if (clickBlocked()) return
    if (letterOpened) {
      audio.sfx('paper')
      setLetterOpen(true)
      return
    }
    if (busy.current) return
    busy.current = true

    audio.sfx('seal')
    setTimeout(() => audio.sfx('paper'), 420)

    const tl = gsap.timeline()
    tl.to(flap.current.rotation, { x: -2.45, duration: 1.4, ease: 'power3.inOut' }, 0.15)
    tl.to(seal.current.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.5, ease: 'back.in(2)' }, 0.3)
    tl.to(seal.current.rotation, { z: 1.2, duration: 0.6 }, 0.3)
    tl.to(
      paperRef.current.position,
      { y: 1.55, z: 0.55, duration: 1.7, ease: 'power3.out' },
      0.85,
    )
    tl.to(paperRef.current.rotation, { x: -0.42, duration: 1.7, ease: 'power3.out' }, 0.85)
    tl.to(paperRef.current.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 1.7, ease: 'power3.out' }, 0.85)
    tl.to(light.current, { intensity: 9, duration: 1.2 }, 0.9)
    tl.to(glowRef.current.material, { opacity: 0.5, duration: 1.3 }, 0.9)

    const t = setTimeout(() => setLetterOpen(true), 2100)
    return () => clearTimeout(t)
  }

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.63, -2]}>
        <circleGeometry args={[46, 40]} />
        <meshStandardMaterial color="#0f040b" roughness={1} />
      </mesh>

      {/* backdrop wall */}
      <mesh position={[0, 3.4, -7.6]}>
        <planeGeometry args={[34, 15]} />
        <meshBasicMaterial map={backdrop} color="#cfa6b2" fog={false} />
      </mesh>
      <Glow color="#ffc3a8" size={13} opacity={0.12} position={[-4.2, 3.8, -6.6]} />
      <Glow color="#e59bb8" size={10} opacity={0.08} position={[4.4, 2.8, -6.4]} />

      {/* desk */}
      <mesh position={[0, -0.31, -1.2]}>
        <boxGeometry args={[14, 0.6, 9.5]} />
        <meshPhysicalMaterial map={wood} color="#b98d83" roughness={0.58} metalness={0.06} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>

      {/* silk runner */}
      <RoundedBox args={[4.2, 0.03, 8.4]} radius={0.02} smoothness={2} position={[0, 0.005, -0.9]}>
        <meshPhysicalMaterial color="#3a0b1f" roughness={0.6} metalness={0.05} sheen={0.65} sheenColor="#ff9db8" sheenRoughness={0.6} />
      </RoundedBox>
      <mesh position={[2.12, 0.02, -0.9]}>
        <boxGeometry args={[0.035, 0.02, 8.4]} />
        <meshStandardMaterial color="#c9a36a" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[-2.12, 0.02, -0.9]}>
        <boxGeometry args={[0.035, 0.02, 8.4]} />
        <meshStandardMaterial color="#c9a36a" metalness={0.85} roughness={0.3} />
      </mesh>

      <SoftShadow position={[0, 0.02, 0.5]} scale={[6, 5]} opacity={0.5} />

      {/* envelope */}
      <group position={[0, 0.02, 0.5]}>
        <group
          onClick={openLetter}
          onPointerOver={(e) => {
            e.stopPropagation()
            setCursor(true)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setCursor(false)
          }}
        >
          <RoundedBox args={[3.6, 0.18, 2.6]} radius={0.05} smoothness={3} position={[0, 0.1, 0]}>
            <meshPhysicalMaterial map={paper} color="#fff8ef" roughness={0.72} metalness={0} sheen={0.35} sheenColor="#fff4e4" />
          </RoundedBox>

          {/* gold edge hairline */}
          <mesh position={[0, 0.196, 0]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[3.62, 0.016]} />
            <meshStandardMaterial color="#d8b785" metalness={0.8} roughness={0.4} transparent opacity={0.7} />
          </mesh>

          {/* paper inside */}
          <group ref={paperRef} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.92}>
            <mesh>
              <planeGeometry args={[3.05, 2.15]} />
              <meshStandardMaterial map={paper} color="#fffaf2" roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* flap */}
          <group ref={flap} position={[0, 0.2, -1.3]}>
            <mesh rotation-x={Math.PI / 2}>
              <extrudeGeometry
                args={[
                  (() => {
                    const s = new THREE.Shape()
                    s.moveTo(-1.72, 0)
                    s.lineTo(1.72, 0)
                    s.lineTo(0, 1.42)
                    s.closePath()
                    return s
                  })(),
                  { depth: 0.055, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1 },
                ]}
              />
              <meshPhysicalMaterial map={paper} color="#fbf0e2" roughness={0.7} sheen={0.4} sheenColor="#fff6e8" />
            </mesh>
            <mesh position={[0, 0.02, 1.36]} rotation-x={-Math.PI / 2}>
              <circleGeometry args={[0.02, 12]} />
              <meshBasicMaterial color="#6d1b36" />
            </mesh>
            {/* wax seal rides with the flap */}
            <group ref={seal} position={[0, 0.14, 1.3]}>
              <mesh rotation-x={-Math.PI / 2}>
                <cylinderGeometry args={[0.29, 0.31, 0.07, 32]} />
                <meshPhysicalMaterial color="#7d1c3a" roughness={0.35} metalness={0.1} clearcoat={0.8} />
              </mesh>
              <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2} scale={0.17}>
                <sphereGeometry args={[1, 16, 12]} />
                <meshStandardMaterial color="#a63354" metalness={0.3} roughness={0.4} />
              </mesh>
            </group>
          </group>

          {/* ribbon under flap */}
          <mesh position={[0, 0.2, 0.1]}>
            <boxGeometry args={[0.28, 0.012, 2.5]} />
            <meshPhysicalMaterial color="#d9b98a" metalness={0.5} roughness={0.35} clearcoat={0.6} />
          </mesh>

          {/* hit area */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[4.2, 1.4, 3.2]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
        </group>

        <sprite ref={glowRef} position={[0, 0.35, 0]} scale={[7, 5, 1]}>
          <spriteMaterial
            map={glowTexture()}
            color="#ffd9b0"
            transparent
            opacity={0.06}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <pointLight ref={light} position={[0, 1.8, 0.8]} color="#ffd8a8" intensity={0} distance={10} decay={2} />
      </group>

      <Candle />
      <DeskRose />
      <InkWell />
      <ScatteredPetals />

      <PetalField count={Math.round(preset.petals * 0.45)} position={[0, 0, 0]} opacity={0.75} />

      {/* lighting */}
      <spotLight position={[1.5, 9, 4]} angle={0.62} penumbra={0.95} intensity={58} color="#ffe8d4" distance={40} />
      <pointLight position={[-5, 3, 4]} intensity={12} color="#ff8fae" distance={20} />
      <pointLight position={[6, 2.5, -3]} intensity={8} color="#c99ad8" distance={18} />
      <Glow color="#ffc9a8" size={14} opacity={0.1} position={[0, 1.8, -6]} />
    </group>
  )
}
