import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const rand = (a, b) => a + Math.random() * (b - a)

export default function FireflyField({
  count = 90,
  position = [0, 2.5, 0],
  spread = 13,
  height = 7,
  speed = 1,
}) {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const phase = new Float32Array(count)
    const spd = new Float32Array(count)
    const size = new Float32Array(count)
    const col = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#ffe6a8'),
      new THREE.Color('#ffd27a'),
      new THREE.Color('#fff3d1'),
      new THREE.Color('#ffc98f'),
    ]
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * spread
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = rand(0.2, height)
      pos[i * 3 + 2] = Math.sin(a) * r * 0.8
      phase[i] = Math.random()
      spd[i] = rand(0.3, 1.0)
      size[i] = rand(3.5, 9.5)
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(spd, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSpeed: { value: speed } },
      vertexShader: /* glsl */ `
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uSpeed;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec3 p = position;
          float t = uTime * uSpeed;
          p.x += sin(t * aSpeed * 0.8 + aPhase * 6.2831) * 1.6;
          p.y += sin(t * aSpeed * 0.55 + aPhase * 3.1416) * 0.9;
          p.z += cos(t * aSpeed * 0.7 + aPhase * 4.712) * 1.4;

          float tw = 0.45 + 0.55 * sin(t * (1.1 + aPhase * 1.6) + aPhase * 9.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * (0.5 + tw) * (26.0 / max(1.0, -mv.z));
          gl_Position = projectionMatrix * mv;
          vColor = aColor;
          vAlpha = 0.25 + tw * 0.75;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.05, d);
          float core = smoothstep(0.18, 0.0, d);
          gl_FragColor = vec4(vColor * (1.4 + core), a * a * vAlpha);
        }
      `,
    })
    return { geo: g, mat: m }
  }, [count, spread, height, speed])

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime
  })

  return <points geometry={geo} material={mat} position={position} frustumCulled={false} />
}
