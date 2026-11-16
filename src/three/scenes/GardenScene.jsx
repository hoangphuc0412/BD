import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import BlossomTree from '../objects/BlossomTree'
import PetalField from '../objects/PetalField'
import FireflyField from '../objects/FireflyField'
import { FloatingHeart, Glow } from '../objects/Hearts'
import { useStore } from '../../lib/store'
import { content } from '../../config/content'
import { QUALITY_PRESETS } from '../../lib/quality'
import { glowTexture, petalTexture, sceneBackdropTexture } from '../../lib/textures'
import { audio } from '../../lib/audio'
import { clickBlocked, setCursor } from '../../lib/interact'

const rand = (a, b) => a + Math.random() * (b - a)

function HintSpark({ position, size = 1.1, color = '#ffd9b4' }) {
  const ref = useRef()
  const glow = useMemo(glowTexture, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    const s = size * (0.85 + Math.sin(t * 1.5) * 0.18)
    ref.current.scale.set(s, s, 1)
    ref.current.material.opacity = 0.26 + Math.sin(t * 1.5) * 0.1
  })
  return (
    <sprite ref={ref} position={position} scale={[size, size, 1]}>
      <spriteMaterial map={glow} color={color} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

function Moon({ onClick }) {
  const hit = useRef()
  return (
    <group position={[-10.6, 13.2, -24]}>
      <mesh>
        <sphereGeometry args={[2.7, 48, 48]} />
        <meshStandardMaterial
          color="#ffe9cf"
          emissive="#ffdfb4"
          emissiveIntensity={0.8}
          roughness={1}
          metalness={0}
          fog={false}
        />
      </mesh>
      <Glow color="#ffe9c9" size={12} opacity={0.24} />
      <Glow color="#ffd9a8" size={24} opacity={0.08} />
      <Glow color="#c9a7ff" size={38} opacity={0.03} />
      <mesh
        ref={hit}
        onClick={(e) => {
          e.stopPropagation()
          if (clickBlocked()) return
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setCursor(false)
        }}
      >
        <sphereGeometry args={[3.6, 12, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  )
}

function Lotus({ position, scale = 1 }) {
  const tex = useMemo(petalTexture, [])
  const petals = useMemo(() => Array.from({ length: 8 }, (_, i) => i), [])
  return (
    <group position={position} scale={scale}>
      {petals.map((i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.34, 0.04, Math.sin(a) * 0.34]}
            rotation={[-1.35, -a + Math.PI / 2, 0]}
            scale={[0.5, 0.72, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              map={tex}
              color="#ffc6d8"
              transparent
              side={THREE.DoubleSide}
              roughness={0.7}
              emissive="#ff9fbd"
              emissiveIntensity={0.22}
              alphaTest={0.15}
            />
          </mesh>
        )
      })}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#ffd28a" emissive="#ffb347" emissiveIntensity={0.9} roughness={0.6} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <circleGeometry args={[0.85, 20]} />
        <meshStandardMaterial color="#1c3323" roughness={0.95} />
      </mesh>
    </group>
  )
}

function Lake({ quality, onClick }) {
  const preset = QUALITY_PRESETS[quality]
  const glow = useMemo(glowTexture, [])
  const streak = useRef()

  useFrame(({ clock }) => {
    if (streak.current) {
      const t = clock.elapsedTime
      streak.current.children.forEach((c, i) => {
        c.material.opacity = 0.05 + Math.abs(Math.sin(t * 0.7 + i)) * 0.07
      })
    }
  })

  return (
    <group position={[-4.5, 0.04, 3.7]}>
      <mesh
        rotation-x={-Math.PI / 2}
        onClick={(e) => {
          e.stopPropagation()
          if (clickBlocked()) return
          onClick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setCursor(false)
        }}
      >
        <circleGeometry args={[6, 96]} />
        {preset.reflections ? (
          <MeshReflectorMaterial
            resolution={quality === 'high' ? 512 : 256}
            blur={[300, 120]}
            mixBlur={1}
            mixStrength={7}
            mirror={0.45}
            roughness={0.85}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.35}
            color="#170611"
            metalness={0.45}
          />
        ) : (
          <meshPhysicalMaterial color="#2a0f1e" roughness={0.22} metalness={0.6} envMapIntensity={1.4} clearcoat={0.8} clearcoatRoughness={0.25} />
        )}
      </mesh>

      {/* moonlight shimmer on the surface */}
      <group ref={streak}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh
            key={i}
            raycast={() => null}
            rotation-x={-Math.PI / 2}
            position={[-0.6 + (i % 2) * 0.55, 0.02, -1.8 + i * 0.62]}
          >
            <planeGeometry args={[0.55 + i * 0.07, 0.9]} />
            <meshBasicMaterial map={glow} color="#ffe2bc" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        <mesh raycast={() => null} rotation-x={-Math.PI / 2} position={[0.4, 0.005, 0.8]}>
          <planeGeometry args={[3.2, 7]} />
          <meshBasicMaterial map={glow} color="#ffd9ae" transparent opacity={0.09} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* rocks */}
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2 + 0.2
        const r = 6.15 + Math.sin(i * 2.3) * 0.25
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.1, Math.sin(a) * r]} scale={[0.55, 0.32, 0.45]} rotation={[rand(0, 1), rand(0, 3), 0]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#1c0b12" roughness={0.85} metalness={0.1} flatShading />
          </mesh>
        )
      })}

      <Lotus position={[1.6, 0.03, 0.9]} scale={0.85} />
      <Lotus position={[-2.2, 0.03, -1.6]} scale={0.65} />
      <Lotus position={[0.4, 0.03, 3.1]} scale={0.55} />
    </group>
  )
}

function Lantern({ onClick }) {
  const pivot = useRef()
  const light = useRef()
  const bodyMat = useRef()
  const glow = useMemo(glowTexture, [])
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (pivot.current) {
      pivot.current.rotation.z = Math.sin(t * 0.55) * 0.075
      pivot.current.rotation.x = Math.cos(t * 0.42) * 0.04
    }
    const flicker = 0.86 + Math.sin(t * 7.1) * 0.06 + Math.sin(t * 13.7) * 0.04
    if (light.current) light.current.intensity = 8 * flicker
    if (bodyMat.current) bodyMat.current.emissiveIntensity = 0.95 * flicker
    if (glowRef.current) glowRef.current.material.opacity = 0.26 * flicker
  })

  return (
    <group position={[5.7, 5.9, -0.6]}>
      <group ref={pivot}>
        <mesh position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1.5, 5]} />
          <meshStandardMaterial color="#2a1b18" roughness={0.9} />
        </mesh>
        <group position={[0, -1.85, 0]}>
          <mesh scale={[0.86, 1.02, 0.86]}>
            <sphereGeometry args={[0.42, 28, 22]} />
            <meshPhysicalMaterial
              ref={bodyMat}
              color="#ffe0b2"
              emissive="#ffb166"
              emissiveIntensity={1.15}
              roughness={0.35}
              metalness={0}
              transparent
              opacity={0.94}
            />
          </mesh>
          <sprite ref={glowRef} scale={[3, 3, 1]}>
            <spriteMaterial map={glow} color="#ffbe7a" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.22, 0.26, 0.1, 20]} />
            <meshStandardMaterial color="#c9a36a" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.24, 0.2, 0.08, 20]} />
            <meshStandardMaterial color="#c9a36a" metalness={0.85} roughness={0.3} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, (i / 4) * Math.PI, 0]} position={[0, 0, 0]}>
              <boxGeometry args={[0.86, 0.76, 0.015]} />
              <meshStandardMaterial color="#8c6a3c" metalness={0.7} roughness={0.4} transparent opacity={0.55} />
            </mesh>
          ))}
          <mesh position={[0, -0.62, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.34, 5]} />
            <meshStandardMaterial color="#a9834d" metalness={0.6} roughness={0.5} />
          </mesh>
          <pointLight ref={light} color="#ffc086" intensity={11} distance={16} decay={2} />
          <mesh
            onClick={(e) => {
              e.stopPropagation()
              if (clickBlocked()) return
              onClick()
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setCursor(true)
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
              setCursor(false)
            }}
          >
            <sphereGeometry args={[0.85, 12, 10]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export default function GardenScene() {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality]
  const showMessage = useStore((s) => s.showMessage)
  const heartIdx = useRef(0)
  const groundTex = useMemo(sceneBackdropTexture, [])

  const say = (key, sfx = 'heart') => () => {
    const m = content.garden.messages[key]
    if (!m) return
    audio.sfx(sfx)
    if (Array.isArray(m)) {
      showMessage(m[heartIdx.current % m.length])
      heartIdx.current += 1
    } else showMessage(m)
  }

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -3]}>
        <circleGeometry args={[62, 72]} />
        <meshStandardMaterial map={groundTex} color="#8a5e6e" roughness={1} metalness={0} />
      </mesh>

      <BlossomTree
        position={[2.7, 0, -3.1]}
        blossomCount={preset.blossoms}
        puffCount={Math.round(preset.blossoms * 0.4)}
        onClick={say('tree', 'click')}
      />

      <Lake quality={quality} onClick={say('lake', 'click')} />

      <Moon onClick={say('star', 'sparkle')} />

      <Lantern onClick={say('lantern', 'heart')} />

      <FloatingHeart
        position={[-2.6, 4.4, 3.4]}
        scale={0.4}
        color="#ec6f92"
        emissive="#ff2f63"
        phase={0.4}
        onClick={(e) => {
          e.stopPropagation()
          if (clickBlocked()) return
          say('heart')()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setCursor(false)
        }}
      />
      <FloatingHeart
        position={[5.5, 3.4, 4.2]}
        scale={0.31}
        color="#f08fb0"
        emissive="#ff5c86"
        phase={2.1}
        speed={0.8}
        onClick={(e) => {
          e.stopPropagation()
          if (clickBlocked()) return
          say('heart')()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setCursor(false)
        }}
      />
      <FloatingHeart
        position={[1.4, 6.6, 1.6]}
        scale={0.26}
        color="#f6b3c8"
        emissive="#ff7ba0"
        phase={4.2}
        speed={1.15}
        onClick={(e) => {
          e.stopPropagation()
          if (clickBlocked()) return
          say('heart')()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setCursor(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setCursor(false)
        }}
      />

      {/* firefly cluster invitation */}
      <group position={[7.2, 1.6, 6.4]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation()
            if (clickBlocked()) return
            say('firefly', 'sparkle')()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setCursor(true)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setCursor(false)
          }}
        >
          <sphereGeometry args={[2.1, 12, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
        <HintSpark position={[0, 0.2, 0]} size={1.4} color="#ffe6a8" />
      </group>

      <HintSpark position={[-1.4, 0.5, 2.1]} size={1.1} color="#ffd9b4" />
      <HintSpark position={[4.2, 9.4, -1.4]} size={1.3} color="#ffd9f0" />
      <HintSpark position={[-6.4, 11.2, -19]} size={1.6} color="#ffe9c9" />

      <FireflyField count={preset.fireflies} position={[1, 1.3, 0]} spread={13} height={7.5} />

      <PetalField count={preset.petals} position={[0, 0, 0]} opacity={0.9} speed={0.9} />

      {/* atmosphere */}
      <pointLight position={[6, 4.6, 0]} intensity={11} color="#ffc487" distance={24} decay={2} />
      <pointLight position={[2, 7, -2]} intensity={18} color="#ff7fa8" distance={34} decay={2} />
      <directionalLight position={[-9, 15, -20]} intensity={0.72} color="#dfe6ff" />
      <spotLight position={[0, 22, 10]} angle={0.6} penumbra={1} intensity={34} color="#ffe6f0" distance={60} />
      <Glow color="#ff9dbc" size={24} opacity={0.06} position={[2, 8, -16]} />
    </group>
  )
}
