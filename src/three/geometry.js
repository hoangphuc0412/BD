import * as THREE from 'three'

let heartGeo = null
export function createHeartGeometry() {
  if (heartGeo) return heartGeo
  const s = new THREE.Shape()
  s.moveTo(0.5, 0.5)
  s.bezierCurveTo(0.5, 0.5, 0.4, 0, 0, 0)
  s.bezierCurveTo(-0.6, 0, -0.6, 0.7, -0.6, 0.7)
  s.bezierCurveTo(-0.6, 1.1, -0.3, 1.54, 0.5, 1.9)
  s.bezierCurveTo(1.3, 1.54, 1.6, 1.1, 1.6, 0.7)
  s.bezierCurveTo(1.6, 0.7, 1.6, 0, 1.0, 0)
  s.bezierCurveTo(0.7, 0, 0.5, 0.5, 0.5, 0.5)

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.13,
    bevelSize: 0.12,
    bevelSegments: 4,
    curveSegments: 26,
  })
  geo.center()
  geo.scale(0.86, 0.86, 0.86)
  geo.computeVertexNormals()
  heartGeo = geo
  return geo
}

let petalInstancedGeo = null
export function basePetalGeometry() {
  if (petalInstancedGeo) return petalInstancedGeo
  petalInstancedGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
  return petalInstancedGeo
}

export function makePetalFieldGeometry(count) {
  const base = basePetalGeometry()
  const geo = new THREE.InstancedBufferGeometry()
  geo.index = base.index
  geo.setAttribute('position', base.attributes.position)
  geo.setAttribute('uv', base.attributes.uv)

  const offsets = new Float32Array(count * 3)
  const seeds = new Float32Array(count * 4) // speed, phase, spin, scale
  const colors = new Float32Array(count * 3)

  const palette = [
    new THREE.Color('#f8c8d8'),
    new THREE.Color('#f2a8c0'),
    new THREE.Color('#e07f9f'),
    new THREE.Color('#c9567c'),
    new THREE.Color('#fde4ea'),
  ]

  for (let i = 0; i < count; i++) {
    offsets[i * 3] = (Math.random() - 0.5) * 26
    offsets[i * 3 + 1] = Math.random() * 18
    offsets[i * 3 + 2] = (Math.random() - 0.5) * 26
    seeds[i * 4] = 0.35 + Math.random() * 0.85
    seeds[i * 4 + 1] = Math.random() * Math.PI * 2
    seeds[i * 4 + 2] = 0.4 + Math.random() * 1.8
    seeds[i * 4 + 3] = 0.08 + Math.random() * 0.12
    const c = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }

  geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3))
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4))
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3))
  geo.instanceCount = count
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 8, 0), 30)
  return geo
}

export const PALETTE = {
  pearl: '#fbf3ec',
  blush: '#f3c3d1',
  rose: '#e58aa9',
  wine: '#6b1735',
  wineDeep: '#3d0c1f',
  champagne: '#e3c297',
  gold: '#c9a36a',
  cream: '#fbeedd',
}
