import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { glowTexture, bokehTexture } from '../lib/textures'
import { useStore } from '../lib/store'

const rand = (a, b) => a + Math.random() * (b - a)

function SkyDome() {
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTime: { value: 0 },
        uTop: { value: new THREE.Color('#040107') },
        uMid: { value: new THREE.Color('#120714') },
        uHorizon: { value: new THREE.Color('#331025') },
        uGlow: { value: new THREE.Color('#8f3f63') },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        uniform vec3 uGlow;
        varying vec3 vDir;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float fbm(vec2 p) {
          float v = 0.0;
          float amp = 0.5;
          for (int i = 0; i < 4; i++) {
            v += amp * noise(p);
            p *= 2.03;
            amp *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 dir = normalize(vDir);
          float h = dir.y;

          vec3 col = mix(uHorizon, uMid, smoothstep(-0.06, 0.32, h));
          col = mix(col, uTop, smoothstep(0.24, 0.92, h));

          float haze = pow(max(0.0, 1.0 - abs(h) * 2.1), 2.4);
          col += uGlow * haze * 0.24;

          vec2 uv = vec2(atan(dir.z, dir.x) / 6.28318, dir.y * 0.5 + 0.5);
          float n = fbm(uv * vec2(7.0, 3.4) + vec2(uTime * 0.006, 0.0));
          float n2 = fbm(uv * vec2(3.0, 6.0) - vec2(uTime * 0.004, 0.2));
          float clouds = smoothstep(0.52, 0.9, n * 0.7 + n2 * 0.5);
          vec3 cloudCol = mix(vec3(0.3, 0.08, 0.18), vec3(0.1, 0.03, 0.09), smoothstep(0.0, 0.5, h));
          col = mix(col, cloudCol, clouds * 0.22);

          float band = sin(dir.x * 2.4 + uTime * 0.02) * sin(dir.z * 3.1 - uTime * 0.016);
          col += vec3(0.09, 0.03, 0.06) * smoothstep(0.15, 0.7, h) * max(0.0, band) * 0.35;

          float vig = smoothstep(1.9, 0.5, distance(dir.xy, vec2(0.0, 0.08)));
          col *= 0.72 + vig * 0.34;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  }, [])

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh scale={400} material={mat} renderOrder={-10}>
      <sphereGeometry args={[1, 48, 32]} />
    </mesh>
  )
}

function StarField({ count = 2200 }) {
  const { dpr } = useThree()
  const mat = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    const palette = [
      new THREE.Color('#fff6ec'),
      new THREE.Color('#ffd9e2'),
      new THREE.Color('#f3c3d1'),
      new THREE.Color('#f6e2c8'),
      new THREE.Color('#dcd7ff'),
    ]
    for (let i = 0; i < count; i++) {
      const r = rand(120, 290)
      const theta = Math.random() * Math.PI * 2
      const y = rand(-0.25, 1)
      const rr = Math.sqrt(1 - y * y)
      pos[i * 3] = Math.cos(theta) * rr * r
      pos[i * 3 + 1] = y * r
      pos[i * 3 + 2] = Math.sin(theta) * rr * r
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
      size[i] = rand(0.5, 2.2)
      phase[i] = Math.random()
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(2, dpr) },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float tw = 0.55 + 0.45 * sin(uTime * (0.5 + aPhase * 0.5) + aPhase * 6.2831);
          gl_PointSize = aSize * uPixelRatio * (230.0 / max(1.0, -mv.z)) * (0.7 + 0.45 * tw);
          gl_Position = projectionMatrix * mv;
          vColor = aColor;
          vTwinkle = tw;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float a = smoothstep(0.5, 0.0, d);
          a = pow(a, 2.6);
          float core = pow(smoothstep(0.16, 0.0, d), 2.0);
          gl_FragColor = vec4(vColor * (0.7 + vTwinkle * 0.8) + core * 0.35, a);
        }
      `,
    })
    return { geo, material }
  }, [count, dpr])

  useFrame(({ clock }) => {
    mat.material.uniforms.uTime.value = clock.elapsedTime
  })

  return <points geometry={mat.geo} material={mat.material} frustumCulled={false} />
}

function Nebula() {
  const glow = useMemo(() => glowTexture(), [])
  const items = useMemo(
    () => [
      { pos: [-52, 18, -88], scale: 118, color: '#7a2347', opacity: 0.22 },
      { pos: [44, 8, -96], scale: 138, color: '#5b1d3d', opacity: 0.18 },
      { pos: [-6, 36, -120], scale: 96, color: '#a4587a', opacity: 0.12 },
      { pos: [24, 52, -140], scale: 80, color: '#c9a36a', opacity: 0.06 },
    ],
    [],
  )

  return (
    <group renderOrder={-8}>
      {items.map((it, i) => (
        <sprite key={i} position={it.pos} scale={[it.scale, it.scale, 1]}>
          <spriteMaterial
            map={glow}
            color={it.color}
            opacity={it.opacity}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  )
}

function AmbientDust({ count = 40 }) {
  const group = useRef()
  const bokeh = useMemo(() => bokehTexture(), [])
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: [rand(-22, 22), rand(0, 15), rand(-28, -3)],
        scale: rand(0.45, 1.7),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.15, 0.5),
        color: ['#ffd9c9', '#f7b7c9', '#ffe9c9', '#f4d4e2', '#e9c3a1'][Math.floor(Math.random() * 5)],
        opacity: rand(0.04, 0.11),
      })),
    [count],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const g = group.current
    if (!g) return
    g.children.forEach((sprite, i) => {
      const it = items[i]
      sprite.position.y = it.pos[1] + Math.sin(t * it.speed + it.phase) * 0.8
      sprite.position.x = it.pos[0] + Math.cos(t * it.speed * 0.7 + it.phase) * 0.6
    })
    g.rotation.y = Math.sin(t * 0.02) * 0.15
  })

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <sprite key={i} position={it.pos} scale={[it.scale, it.scale, 1]}>
          <spriteMaterial
            map={bokeh}
            color={it.color}
            opacity={it.opacity}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}

export default function Background() {
  const quality = useStore((s) => s.quality)
  const stars = quality === 'high' ? 3000 : quality === 'balanced' ? 1800 : 950
  const dust = quality === 'high' ? 44 : quality === 'balanced' ? 30 : 16

  return (
    <group>
      <SkyDome />
      <StarField count={stars} />
      <Nebula />
      <AmbientDust count={dust} />
    </group>
  )
}
