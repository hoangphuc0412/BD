import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import * as THREE from 'three'
import Background from './Background'
import CameraRig from './CameraRig'
import Effects from './Effects'
import SceneManager from './SceneManager'
import { QUALITY_PRESETS } from '../lib/quality'
import { useStore } from '../lib/store'
import { pointerState } from '../lib/interact'

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.32} color="#ffd7e4" />
      <hemisphereLight args={['#ffd9e6', '#1a0611', 0.55]} />
      <directionalLight position={[6, 12, 8]} intensity={0.55} color="#ffe9d8" />
      <directionalLight position={[-8, 6, -6]} intensity={0.35} color="#c98aa8" />
    </>
  )
}

function PointerTracker() {
  useEffect(() => {
    const onMove = (e) => {
      pointerState.x = e.clientX
      pointerState.y = e.clientY
      pointerState.nx = (e.clientX / window.innerWidth) * 2 - 1
      pointerState.ny = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onLeave = () => {
      pointerState.nx = 0
      pointerState.ny = 0
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])
  return null
}

function ToneMappingSetup() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.16
  }, [gl])
  return null
}

function DevBridge() {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__scene = scene
    window.__camera = camera
  }, [scene, camera])
  return null
}

export default function SceneCanvas() {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.balanced

  return (
    <Canvas
      dpr={preset.dpr}
      camera={{ position: [0, 6, 20], fov: 45, near: 0.1, far: 900 }}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
      }}
      onCreated={({ gl }) => gl.setClearColor('#0c0309')}
      className="!absolute inset-0"
    >
      <fogExp2 attach="fog" args={['#1a0714', 0.0072]} />
      <ToneMappingSetup />
      <DevBridge />
      <PointerTracker />
      <SceneLights />
      <Suspense fallback={null}>
        <Background />
        <CameraRig />
        <SceneManager />
        <Effects />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
