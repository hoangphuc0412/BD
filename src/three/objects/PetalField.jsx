import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makePetalFieldGeometry } from '../geometry'
import { petalTexture } from '../../lib/textures'

/**
 * GPU-driven petal fall. One draw call, hundreds of petals.
 */
export default function PetalField({
  count = 260,
  position = [0, 9, 0],
  opacity = 1,
  speed = 1,
  tint = '#ffffff',
}) {
  const tex = useMemo(petalTexture, [])

  const { geo, mat } = useMemo(() => {
    const g = makePetalFieldGeometry(count)
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uMap: { value: tex },
        uOpacity: { value: opacity },
        uSpeed: { value: speed },
        uTint: { value: new THREE.Color(tint) },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aOffset;
        attribute vec4 aSeed;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float h = 19.0;
          float speed = aSeed.x * 0.5 * uSpeed;
          float phase = aSeed.y;
          float spin = aSeed.z;
          float size = aSeed.w;

          float fall = mod(uTime * speed + phase * 1.7, 1.0);
          float y = (1.0 - fall) * h;

          vec3 pos = aOffset;
          pos.y = y - 1.5;
          pos.x += sin(uTime * 0.45 + phase * 6.2831) * 1.25;
          pos.z += cos(uTime * 0.36 + phase * 4.712) * 1.0;

          float ang = uTime * spin + phase * 6.2831;
          vec3 p = position * size;
          float ca = cos(ang), sa = sin(ang);
          p.xy = mat2(ca, -sa, sa, ca) * p.xy;
          float ca2 = cos(ang * 0.6), sa2 = sin(ang * 0.6);
          p.xz = mat2(ca2, -sa2, sa2, ca2) * p.xz;

          vec4 mv = modelViewMatrix * vec4(pos + p, 1.0);
          gl_Position = projectionMatrix * mv;

          vUv = uv;
          vColor = aColor;
          vAlpha = smoothstep(0.0, 1.8, y) * (1.0 - smoothstep(h - 1.6, h, y));
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform float uOpacity;
        uniform vec3 uTint;
        varying vec2 vUv;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec4 t = texture2D(uMap, vUv);
          vec3 col = vColor * uTint * (0.9 + 0.25 * vUv.y);
          gl_FragColor = vec4(col, t.a * vAlpha * uOpacity);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
    })
    return { geo: g, mat: m }
  }, [count, tex, opacity, speed, tint])

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime + 12
  })

  return <mesh geometry={geo} material={mat} position={position} frustumCulled={false} />
}
