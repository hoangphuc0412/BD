import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { petalTexture, glowTexture } from '../../lib/textures'
import { clickBlocked, setCursor } from '../../lib/interact'

const randOf = (seed) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const UP = new THREE.Vector3(0, 1, 0)

function buildTree(seed) {
  const rnd = randOf(seed)
  const parts = []
  const tips = []

  const segment = (a, b, r0, r1) => {
    const len = a.distanceTo(b)
    const g = new THREE.CylinderGeometry(r1, r0, len, 7, 1, true)
    g.translate(0, len / 2, 0)
    const dir = b.clone().sub(a).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir)
    g.applyMatrix4(new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1)))
    parts.push(g)
  }

  const grow = (start, dir, len, radius, depth) => {
    const end = start.clone().addScaledVector(dir, len)
    const mid = start.clone().lerp(end, 0.5)
    mid.x += (rnd() - 0.5) * len * 0.34
    mid.z += (rnd() - 0.5) * len * 0.34
    mid.y += len * 0.05
    segment(start, mid, radius, radius * 0.82)
    segment(mid, end, radius * 0.82, radius * 0.64)

    if (depth <= 0) {
      tips.push(end.clone())
      return
    }
    const branches = depth >= 3 ? 3 : rnd() > 0.42 ? 3 : 2
    for (let i = 0; i < branches; i++) {
      const axis = new THREE.Vector3(rnd() - 0.5, rnd() * 0.3, rnd() - 0.5).normalize()
      const nd = dir.clone().applyAxisAngle(axis, 0.42 + rnd() * 0.5)
      nd.y += 0.12
      nd.normalize()
      grow(end, nd, len * (0.68 + rnd() * 0.15), radius * 0.64, depth - 1)
    }
  }

  grow(new THREE.Vector3(0, 0, 0), UP.clone(), 2.75, 0.54, 3)

  // roots
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rnd() * 0.4
    const start = new THREE.Vector3(0, 0.35, 0)
    const end = new THREE.Vector3(Math.cos(a) * (1.1 + rnd() * 0.7), 0.02, Math.sin(a) * (1.1 + rnd() * 0.7))
    segment(start, end, 0.3, 0.08)
  }

  const trunk = mergeGeometries(parts, false)
  trunk.computeVertexNormals()

  const blossoms = []
  const puffs = []
  const palette = ['#ffe3ea', '#ffc9da', '#f9b5cb', '#f3a2bd', '#fff2f5', '#ffd6e2']
  tips.forEach((tip) => {
    const n = 8 + Math.floor(rnd() * 6)
    for (let i = 0; i < n; i++) {
      const off = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.5)
      blossoms.push({
        pos: tip.clone().add(off),
        rot: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI],
        scale: 0.22 + rnd() * 0.26,
        color: new THREE.Color(palette[Math.floor(rnd() * palette.length)]),
      })
    }
    const m = 3 + Math.floor(rnd() * 3)
    for (let i = 0; i < m; i++) {
      const off = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.05)
      puffs.push({
        pos: tip.clone().add(off),
        scale: 0.16 + rnd() * 0.2,
        color: new THREE.Color(palette[Math.floor(rnd() * palette.length)]),
      })
    }
  })

  for (let i = blossoms.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[blossoms[i], blossoms[j]] = [blossoms[j], blossoms[i]]
  }

  return { trunk, blossoms, puffs, tipCount: tips.length }
}

export default function BlossomTree({
  position = [0, 0, 0],
  seed = 1120,
  blossomCount = 620,
  puffCount = 240,
  onClick,
}) {
  const data = useMemo(() => buildTree(seed), [seed])
  const tex = useMemo(petalTexture, [])
  const glow = useMemo(glowTexture, [])
  const group = useRef()
  const blossomRef = useRef()
  const puffRef = useRef()
  const hintRef = useRef()

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    const count = Math.min(blossomCount, data.blossoms.length)
    for (let i = 0; i < count; i++) {
      const b = data.blossoms[i]
      dummy.position.copy(b.pos)
      dummy.rotation.set(b.rot[0], b.rot[1], b.rot[2])
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      blossomRef.current.setMatrixAt(i, dummy.matrix)
      blossomRef.current.setColorAt(i, b.color)
    }
    blossomRef.current.count = count
    blossomRef.current.instanceMatrix.needsUpdate = true
    if (blossomRef.current.instanceColor) blossomRef.current.instanceColor.needsUpdate = true

    const pCount = Math.min(puffCount, data.puffs.length)
    for (let i = 0; i < pCount; i++) {
      const p = data.puffs[i]
      dummy.position.copy(p.pos)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      puffRef.current.setMatrixAt(i, dummy.matrix)
      puffRef.current.setColorAt(i, p.color)
    }
    puffRef.current.count = pCount
    puffRef.current.instanceMatrix.needsUpdate = true
    if (puffRef.current.instanceColor) puffRef.current.instanceColor.needsUpdate = true
  }, [data, blossomCount, puffCount])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.28) * 0.006
      group.current.rotation.x = Math.cos(t * 0.22) * 0.004
    }
    if (hintRef.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.14
      hintRef.current.scale.set(1.9 * s, 1.9 * s, 1)
      hintRef.current.material.opacity = 0.22 + Math.sin(t * 1.6) * 0.07
    }
  })

  const handleOver = (e) => {
    e.stopPropagation()
    setCursor(true)
  }
  const handleOut = (e) => {
    e.stopPropagation()
    setCursor(false)
  }
  const handleClick = (e) => {
    e.stopPropagation()
    if (clickBlocked()) return
    setCursor(false)
    onClick?.(e)
  }

  return (
    <group position={position}>
      <group ref={group}>
        <mesh geometry={data.trunk}>
          <meshStandardMaterial color="#4a2a24" roughness={0.94} metalness={0} />
        </mesh>

        <instancedMesh ref={blossomRef} args={[undefined, undefined, data.blossoms.length]} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            map={tex}
            transparent
            alphaTest={0.22}
            side={THREE.DoubleSide}
            roughness={0.72}
            metalness={0}
            emissive="#ff9dbb"
            emissiveIntensity={0.16}
          />
        </instancedMesh>

        <instancedMesh ref={puffRef} args={[undefined, undefined, data.puffs.length]} frustumCulled={false}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#ffd7e3"
            roughness={0.95}
            metalness={0}
            emissive="#ffb0c9"
            emissiveIntensity={0.22}
            flatShading
          />
        </instancedMesh>
      </group>

      {/* glowing invitation over the canopy */}
      <sprite ref={hintRef} position={[0, 5.6, 2.2]} scale={[1.9, 1.9, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffdcc2"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* clickable canopy */}
      <mesh
        position={[0, 5.6, 0]}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <sphereGeometry args={[3.5, 14, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  )
}
