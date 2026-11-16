import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import PetalField from '../objects/PetalField'
import HeartMesh, { Glow } from '../objects/Hearts'
import SoftShadow from '../objects/SoftShadow'
import { useStore } from '../../lib/store'
import { QUALITY_PRESETS } from '../../lib/quality'
import { createHeartGeometry } from '../geometry'
import { glowTexture, marbleTexture } from '../../lib/textures'

const rand = (a, b) => a + Math.random() * (b - a)

const TIERS = [
  { r: 2.6, h: 1.5, y: 1.35, color: '#f7e2d2', frosting: '#fff6ea' },
  { r: 2.05, h: 1.2, y: 2.72, color: '#f2c6d3', frosting: '#fff0f3' },
  { r: 1.5, h: 1.0, y: 3.85, color: '#f9e8dd', frosting: '#fff8ef' },
]

const ROSE_POSITIONS = [
  { a: 0.4, tier: 0, r: 2.1 },
  { a: 1.5, tier: 0, r: 2.15 },
  { a: 2.6, tier: 0, r: 2.1 },
  { a: 3.7, tier: 0, r: 2.15 },
  { a: 4.8, tier: 0, r: 2.1 },
  { a: 5.7, tier: 0, r: 2.12 },
  { a: 0.9, tier: 1, r: 1.6 },
  { a: 2.2, tier: 1, r: 1.62 },
  { a: 3.5, tier: 1, r: 1.6 },
  { a: 4.9, tier: 1, r: 1.62 },
  { a: 0.2, tier: 2, r: 1.08 },
  { a: 2.4, tier: 2, r: 1.05 },
  { a: 4.3, tier: 2, r: 1.08 },
]

function tierTop(tier) {
  return TIERS[tier].y + TIERS[tier].h / 2
}

function CreamDrips({ tier }) {
  const t = TIERS[tier]
  const count = 22
  const ref = useRef()
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: (i / count) * Math.PI * 2,
        len: 0.1 + Math.random() * 0.13,
        w: 0.06 + Math.random() * 0.04,
      })),
    [],
  )
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    items.forEach((it, i) => {
      dummy.position.set(Math.cos(it.a) * (t.r - 0.03), tierTop(tier), Math.sin(it.a) * (t.r - 0.03))
      dummy.rotation.set(0, -it.a, 0)
      dummy.scale.set(it.w, it.len, it.w)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items, tier, t.r])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshPhysicalMaterial color={t.frosting} roughness={0.42} clearcoat={0.35} sheen={0.6} sheenColor="#fff8ec" />
    </instancedMesh>
  )
}

function Roses() {
  const ref = useRef()
  const count = ROSE_POSITIONS.length * 7
  const palette = ['#7d1f3f', '#a52c52', '#cd5c7e', '#e68aa4', '#f3b6c8']

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    let idx = 0
    ROSE_POSITIONS.forEach((rp, ri) => {
      const t = TIERS[rp.tier]
      const y = tierTop(rp.tier) + 0.18
      const cx = Math.cos(rp.a) * rp.r
      const cz = Math.sin(rp.a) * rp.r
      const base = new THREE.Color(palette[ri % palette.length])
      for (let p = 0; p < 6; p++) {
        const pa = (p / 6) * Math.PI * 2 + ri
        dummy.position.set(cx + Math.cos(pa) * 0.11, y + 0.03, cz + Math.sin(pa) * 0.11)
        dummy.rotation.set(0.5 + (p % 2) * 0.3, -pa, 0.25)
        dummy.scale.set(0.15, 0.06, 0.11)
        dummy.updateMatrix()
        ref.current.setMatrixAt(idx, dummy.matrix)
        color.copy(base).offsetHSL(0, 0.02, 0.05 + (p % 3) * 0.035)
        ref.current.setColorAt(idx, color)
        idx++
      }
      dummy.position.set(cx, y + 0.08, cz)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(0.085, 0.07, 0.085)
      dummy.updateMatrix()
      ref.current.setMatrixAt(idx, dummy.matrix)
      color.copy(base).offsetHSL(0, 0.05, -0.06)
      ref.current.setColorAt(idx, color)
      idx++
      void t
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshPhysicalMaterial roughness={0.42} metalness={0.05} clearcoat={0.6} clearcoatRoughness={0.3} flatShading />
    </instancedMesh>
  )
}

function Candles({ flameFactor, lightRef }) {
  const flames = useRef([])
  const candleTopY = tierTop(2) + 0.02

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    flames.current.forEach((f, i) => {
      if (!f) return
      const flick = 0.85 + Math.sin(t * 9.2 + i * 2.1) * 0.1 + Math.sin(t * 15.7 + i) * 0.06
      const k = flameFactor.current.v * flick
      f.scale.set(0.26 * k + 0.001, 0.62 * k + 0.001, 1)
      f.material.opacity = k
    })
    if (lightRef.current) {
      lightRef.current.intensity = 7 * flameFactor.current.v * (0.9 + Math.sin(t * 8.1) * 0.08)
    }
  })

  return (
    <group>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.4
        const r = 0.72
        return (
          <group key={i} position={[Math.cos(a) * r, candleTopY, Math.sin(a) * r]}>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.14, 0.16, 0.08, 20]} />
              <meshStandardMaterial color="#c9a36a" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.47, 0]}>
              <cylinderGeometry args={[0.062, 0.07, 0.82, 18]} />
              <meshPhysicalMaterial color={i % 2 ? '#fbe9d6' : '#ffd9e2'} roughness={0.5} sheen={0.8} sheenColor="#fff4e6" />
            </mesh>
            <mesh position={[0, 0.47, 0]} rotation-x={-Math.PI / 2}>
              <torusGeometry args={[0.066, 0.008, 6, 20]} />
              <meshStandardMaterial color="#e0bd8c" metalness={0.7} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
              <meshStandardMaterial color="#2a150b" />
            </mesh>
            <sprite ref={(el) => (flames.current[i] = el)} position={[0, 1.02, 0]}>
              <spriteMaterial
                map={glowTexture()}
                color="#ffbe72"
                transparent
                opacity={1}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
            <sprite position={[0, 1.02, 0]} scale={[1.1, 1.7, 1]}>
              <spriteMaterial
                map={glowTexture()}
                color="#ff9a4d"
                transparent
                opacity={0.24}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </group>
        )
      })}
      <pointLight ref={lightRef} position={[0, candleTopY + 1.2, 0]} color="#ffbd7d" intensity={7} distance={13} decay={2} />
    </group>
  )
}

function Fireworks({ intense }) {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality]
  const BURSTS = 3
  const PER = preset.fireworkParticles
  const total = BURSTS * PER
  const palette = ['#ffb3c8', '#ffd9a6', '#ffffff', '#d9b3ff', '#ff8fab', '#ffe9c9', '#ffc38a']

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(total * 3)
    const col = new Float32Array(total * 3)
    const alpha = new Float32Array(total)
    const size = new Float32Array(total)
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 12, -18), 60)
    return g
  }, [total])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {},
        vertexShader: /* glsl */ `
          attribute vec3 aColor;
          attribute float aAlpha;
          attribute float aSize;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (0.35 + aAlpha) * (150.0 / max(1.0, -mv.z));
            gl_Position = projectionMatrix * mv;
            vColor = aColor;
            vAlpha = aAlpha;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            float a = pow(smoothstep(0.5, 0.0, d), 2.0);
            gl_FragColor = vec4(vColor * (1.0 + vAlpha * 1.6), a * vAlpha);
          }
        `,
      }),
    [],
  )

  const bursts = useMemo(
    () =>
      Array.from({ length: BURSTS }, (_, b) => ({
        active: false,
        t: 0,
        life: rand(2.3, 3.0),
        origin: new THREE.Vector3(),
        vel: new Float32Array(PER * 3),
        pending: 0.5 + b * 1.1,
      })),
    [PER],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const pos = geo.attributes.position.array
    const col = geo.attributes.aColor.array
    const alpha = geo.attributes.aAlpha.array
    const size = geo.attributes.aSize.array
    let colorsDirty = false

    bursts.forEach((b, bi) => {
      if (!b.active) {
        b.pending -= dt
        if (b.pending <= 0) {
          b.active = true
          b.t = 0
          b.life = rand(2.3, 3.1)
          b.origin.set(rand(-15, 15), rand(9.5, 17), rand(-26, -13))
          const c = new THREE.Color(palette[Math.floor(Math.random() * palette.length)])
          for (let i = 0; i < PER; i++) {
            const idx = bi * PER + i
            const u = Math.random() * 2 - 1
            const th = Math.random() * Math.PI * 2
            const s = Math.sqrt(Math.max(0, 1 - u * u))
            const speed = rand(3.2, 9.5)
            b.vel[i * 3] = Math.cos(th) * s * speed
            b.vel[i * 3 + 1] = u * speed
            b.vel[i * 3 + 2] = Math.sin(th) * s * speed
            pos[idx * 3] = b.origin.x
            pos[idx * 3 + 1] = b.origin.y
            pos[idx * 3 + 2] = b.origin.z
            const cc = c.clone().offsetHSL(0, 0, rand(-0.08, 0.14))
            col[idx * 3] = cc.r
            col[idx * 3 + 1] = cc.g
            col[idx * 3 + 2] = cc.b
            alpha[idx] = 0
            size[idx] = rand(1.4, 3.6)
          }
          b.pending = rand(2.8, 5.2) * (intense ? 0.55 : 1)
          colorsDirty = true
        }
      } else {
        b.t += dt
        const p = b.t / b.life
        const drag = 1 - 1.15 * dt
        for (let i = 0; i < PER; i++) {
          const idx = bi * PER + i
          const v = i * 3
          b.vel[v] *= drag
          b.vel[v + 1] = b.vel[v + 1] * drag - 2.9 * dt
          b.vel[v + 2] *= drag
          pos[idx * 3] += b.vel[v] * dt
          pos[idx * 3 + 1] += b.vel[v + 1] * dt
          pos[idx * 3 + 2] += b.vel[v + 2] * dt
          alpha[idx] = Math.max(0, 1 - p) ** 1.6 * (0.6 + 0.4 * Math.sin(b.t * 14 + i))
        }
        if (b.t > b.life) {
          b.active = false
          for (let i = 0; i < PER; i++) alpha[bi * PER + i] = 0
        }
      }
    })

    geo.attributes.position.needsUpdate = true
    geo.attributes.aAlpha.needsUpdate = true
    if (colorsDirty) {
      geo.attributes.aColor.needsUpdate = true
      geo.attributes.aSize.needsUpdate = true
    }
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}

function RisingHearts({ active }) {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality]
  const N = preset.risingHearts
  const heartGeo = useMemo(createHeartGeometry, [])
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        emissive: '#ff4f7a',
        emissiveIntensity: 0.75,
        roughness: 0.35,
        metalness: 0.05,
        clearcoat: 0.8,
        sheen: 1,
        sheenColor: '#ffd3de',
      }),
    [],
  )
  const ref = useRef()
  const parts = useMemo(
    () =>
      Array.from({ length: N }, () => ({
        x: rand(-3.6, 3.6),
        z: rand(-5, 0.4),
        speed: rand(1.6, 4.2),
        delay: rand(0, 11),
        scale: rand(0.1, 0.26),
        sway: rand(0.4, 1.2),
        phase: rand(0, 6.28),
        spin: rand(-1.2, 1.2),
      })),
    [N],
  )
  const palette = ['#ff9fb9', '#ffd0b0', '#fff0e2', '#ff7fa0']

  useLayoutEffect(() => {
    const c = new THREE.Color()
    for (let i = 0; i < N; i++) {
      c.set(palette[i % palette.length])
      ref.current.setColorAt(i, c)
    }
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [N])

  useFrame(({ clock }) => {
    if (!active) return
    const t = clock.elapsedTime
    const dummy = new THREE.Object3D()
    for (let i = 0; i < N; i++) {
      const p = parts[i]
      const local = ((t * p.speed + p.delay) % 15) / 15
      const y = 4.2 + local * 17
      const fade = Math.min(1, local * 6) * (1 - Math.max(0, (local - 0.78) / 0.22))
      dummy.position.set(
        p.x + Math.sin(t * 0.7 + p.phase) * p.sway,
        y,
        p.z + Math.cos(t * 0.6 + p.phase) * p.sway * 0.6,
      )
      dummy.rotation.set(Math.sin(t + p.phase) * 0.3, t * p.spin + p.phase, Math.cos(t * 0.8 + p.phase) * 0.2)
      dummy.scale.setScalar(Math.max(0.0001, p.scale * fade))
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[heartGeo, mat, N]} visible={active} frustumCulled={false} />
}

export default function CelebrationScene() {
  const quality = useStore((s) => s.quality)
  const preset = QUALITY_PRESETS[quality]
  const wishMade = useStore((s) => s.wishMade)
  const marble = useMemo(marbleTexture, [])
  const flameFactor = useRef({ v: 1 })
  const candleLight = useRef()
  const burst = useRef()
  const beam = useRef()
  const ring = useRef()
  const introGroup = useRef()

  useEffect(() => {
    if (introGroup.current) {
      gsap.fromTo(
        introGroup.current.scale,
        { x: 0.001, y: 0.001, z: 0.001 },
        { x: 1, y: 1, z: 1, duration: 1.7, ease: 'back.out(1.5)', delay: 0.2 },
      )
      gsap.fromTo(
        introGroup.current.rotation,
        { y: -0.5 },
        { y: 0, duration: 2.2, ease: 'power3.out', delay: 0.2 },
      )
    }
  }, [])

  useEffect(() => {
    if (!wishMade) return
    const tl = gsap.timeline()
    tl.to(flameFactor.current, { v: 0, duration: 1.15, ease: 'power2.in' }, 0.15)
    tl.to(candleLight.current, { intensity: 0, duration: 1.2 }, 0.15)
    tl.fromTo(
      burst.current.scale,
      { x: 0.5, y: 0.5, z: 1 },
      { x: 18, y: 18, z: 1, duration: 2.4, ease: 'power2.out' },
      0.75,
    )
    tl.fromTo(burst.current.material, { opacity: 0 }, { opacity: 0.75, duration: 0.5 }, 0.75)
    tl.to(burst.current.material, { opacity: 0, duration: 1.9, ease: 'power2.in' }, 1.25)
    tl.fromTo(beam.current.material, { opacity: 0 }, { opacity: 0.3, duration: 0.6 }, 0.8)
    tl.to(beam.current.material, { opacity: 0, duration: 1.8, ease: 'power2.in' }, 1.4)
    tl.fromTo(
      ring.current.scale,
      { x: 0.4, y: 0.4, z: 0.4 },
      { x: 22, y: 22, z: 22, duration: 2.2, ease: 'power2.out' },
      0.8,
    )
    tl.fromTo(ring.current.material, { opacity: 0.85 }, { opacity: 0, duration: 2.1 }, 0.85)
  }, [wishMade])

  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * 0.4
  })

  return (
    <group>
      {/* stage */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, 0]}>
        <circleGeometry args={[46, 64]} />
        <meshStandardMaterial color="#0e040a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[11, 80]} />
        <meshPhysicalMaterial map={marble} color="#a87c8a" roughness={0.3} metalness={0.35} clearcoat={0.5} clearcoatRoughness={0.35} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[10.85, 10.98, 96]} />
        <meshStandardMaterial color="#a9834d" metalness={0.9} roughness={0.3} emissive="#4a3116" emissiveIntensity={0.2} />
      </mesh>

      <SoftShadow position={[0, 0.04, 0]} scale={[15, 15]} opacity={0.65} />

      <group ref={introGroup}>
        {/* cake stand */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[1.15, 1.5, 0.52, 40]} />
          <meshStandardMaterial color="#c9a36a" metalness={0.92} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[3.9, 4.1, 0.14, 72]} />
          <meshStandardMaterial color="#d9b98a" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.64, 0]}>
          <cylinderGeometry args={[3.72, 3.78, 0.1, 72]} />
          <meshStandardMaterial color="#f7eee6" roughness={0.35} metalness={0.1} />
        </mesh>

        {TIERS.map((t, i) => (
          <group key={i}>
            <mesh position={[0, t.y, 0]}>
              <cylinderGeometry args={[t.r * 0.985, t.r, t.h, 72]} />
              <meshPhysicalMaterial
                color={t.color}
                roughness={0.52}
                metalness={0.02}
                sheen={0.6}
                sheenColor="#fff6ec"
                clearcoat={0.2}
                clearcoatRoughness={0.6}
              />
            </mesh>
            <mesh position={[0, tierTop(i), 0]} rotation-x={-Math.PI / 2}>
              <torusGeometry args={[t.r * 0.99, 0.06, 10, 72]} />
              <meshPhysicalMaterial color={t.frosting} roughness={0.35} clearcoat={0.4} sheen={0.8} sheenColor="#fffaf2" />
            </mesh>
            <mesh position={[0, t.y - t.h / 2 + 0.02, 0]} rotation-x={-Math.PI / 2}>
              <torusGeometry args={[t.r + 0.015, 0.026, 8, 72]} />
              <meshStandardMaterial color="#c9a36a" metalness={0.9} roughness={0.28} />
            </mesh>
            <CreamDrips tier={i} />
          </group>
        ))}

        <Roses />

        {/* hearts on the cake */}
        {[0.9, 2.6, 4.3].map((a, i) => (
          <group key={i} position={[Math.cos(a) * 0.95, tierTop(2) + 0.22, Math.sin(a) * 0.95]} rotation={[0, -a, 0]} scale={0.13}>
            <HeartMesh scale={1} color="#e58aa9" emissive="#ff5c86" emissiveIntensity={0.5} halo={0.8} haloOpacity={0.25} />
          </group>
        ))}

        <Candles flameFactor={flameFactor} lightRef={candleLight} />

        {/* wish burst */}
        <sprite ref={burst} position={[0, 4.6, 0]} scale={[0.5, 0.5, 1]}>
          <spriteMaterial
            map={glowTexture()}
            color="#ffe0b8"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <mesh ref={beam} position={[0, 12, 0]}>
          <cylinderGeometry args={[7, 1.6, 16, 40, 1, true]} />
          <meshBasicMaterial
            color="#ffdcaa"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            map={glowTexture()}
          />
        </mesh>
        <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.66, 0]}>
          <ringGeometry args={[0.85, 1.0, 64]} />
          <meshBasicMaterial color="#ffe3bb" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <RisingHearts active={wishMade} />
      <Fireworks intense={wishMade} />
      <PetalField count={preset.petals} position={[0, 0, 0]} opacity={0.85} />

      {/* floating hearts around the cake */}
      {[
        [-5.4, 3.2, 2.2, 0.24, 0.3],
        [5.6, 2.6, 2.6, 0.19, 1.6],
        [-4.2, 6.2, -1.4, 0.15, 3.4],
        [4.6, 6.6, -0.8, 0.17, 5.0],
      ].map(([x, y, z, s, ph], i) => (
        <FloatingDecoHeart key={i} position={[x, y, z]} scale={s} phase={ph} />
      ))}

      <Glow color="#ffb3c8" size={32} opacity={0.06} position={[0, 6, -12]} />
      <Glow color="#ffd6a8" size={18} opacity={0.07} position={[0, 4.6, -2]} />
      <pointLight position={[-7, 5, 5]} intensity={15} color="#ff94b4" distance={30} />
      <pointLight position={[7, 4, -2]} intensity={12} color="#ffcf9e" distance={28} />
      <spotLight position={[3, 15, 9]} angle={0.55} penumbra={1} intensity={72} color="#fff0e8" distance={60} />
      <spotLight position={[-4, 9, -6]} angle={0.6} penumbra={1} intensity={26} color="#ffc6da" distance={40} />
    </group>
  )
}

function FloatingDecoHeart({ position, scale, phase }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(t * 0.65 + phase) * 0.4
    ref.current.rotation.y = t * 0.25 + phase
    ref.current.rotation.z = Math.sin(t * 0.5 + phase) * 0.16
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <HeartMesh scale={1} color="#ec7d9e" emissive="#ff3f6b" emissiveIntensity={0.7} halo={1.6} haloOpacity={0.32} />
    </group>
  )
}
