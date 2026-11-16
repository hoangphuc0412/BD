import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import CAMERAS from './cameraConfig'
import { useStore } from '../lib/store'
import { pointerState, markDragStart, markDragMove, markDragEnd } from '../lib/interact'
import { prefersReducedMotion } from '../lib/quality'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export default function CameraRig() {
  const { camera, gl, size } = useThree()
  const scene = useStore((s) => s.scene)
  const epoch = useStore((s) => s.epoch)
  const cfg = CAMERAS[scene] || CAMERAS.gift
  const reduced = useMemo(prefersReducedMotion, [])
  const narrow = clamp((1.15 - size.width / Math.max(1, size.height)) / 0.55, 0, 1)
  const boost = 1 + (cfg.narrowBoost || 0) * narrow

  const rig = useRef({
    yaw: 0,
    pitch: cfg.pitch,
    dist: cfg.dist,
    yawT: 0,
    pitchT: cfg.pitch,
    distT: cfg.dist,
    sx: 0,
    sy: 0,
    arrival: { d: 11, yaw: 0.5, lift: 4, pitch: -0.06 },
  })

  useEffect(() => {
    const r = rig.current
    r.yawT = 0
    r.pitchT = cfg.pitch
    r.distT = cfg.dist * boost
    r.yaw = r.yawT * 0.5
    r.pitch = cfg.pitch + 0.04
    r.dist = cfg.dist * boost + 10
    r.arrival.d = reduced ? 0 : 10.5
    r.arrival.yaw = reduced ? 0 : 0.5
    r.arrival.lift = reduced ? 0 : 3.6
    r.arrival.pitch = reduced ? 0 : -0.06

    const tween = gsap.to(r.arrival, {
      d: 0,
      yaw: 0,
      lift: 0,
      pitch: 0,
      duration: 2.9,
      ease: 'power3.inOut',
      overwrite: true,
    })
    const fovTween = gsap.to(camera, {
      fov: cfg.fov,
      duration: 2.4,
      ease: 'power2.inOut',
      onUpdate: () => camera.updateProjectionMatrix(),
      overwrite: true,
    })
    return () => {
      tween.kill()
      fovTween.kill()
    }
  }, [scene, epoch, cfg, camera, reduced, boost])

  useEffect(() => {
    const el = gl.domElement
    const minDist = cfg.minDist * boost
    const maxDist = cfg.maxDist * boost
    const pointers = new Map()
    let dragging = false
    let lastX = 0
    let lastY = 0
    let dragAcc = 0
    let pinchStart = 0
    let pinchBase = 0

    const onDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 1) {
        dragging = true
        lastX = e.clientX
        lastY = e.clientY
        dragAcc = 0
        markDragStart()
      } else if (pointers.size === 2) {
        dragging = false
        const [a, b] = [...pointers.values()]
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y) || 1
        pinchBase = rig.current.distT
        markDragMove(30)
      }
      try {
        el.setPointerCapture(e.pointerId)
      } catch {}
    }

    const onMove = (e) => {
      const r = rig.current
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchStart > 0) {
          r.distT = clamp(pinchBase * (pinchStart / Math.max(1, d)), minDist, maxDist)
        }
        return
      }

      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      dragAcc += Math.hypot(dx, dy)
      markDragMove(dragAcc)

      const scale = Math.min(window.innerWidth, 1400) / 1400
      r.yawT = clamp(r.yawT - (dx * 0.0052) / Math.max(0.6, scale), -cfg.yawLimit, cfg.yawLimit)
      r.pitchT = clamp(r.pitchT + (dy * 0.0032) / Math.max(0.6, scale), cfg.minPitch, cfg.maxPitch)
    }

    const onUp = (e) => {
      pointers.delete(e.pointerId)
      if (pointers.size === 0) {
        dragging = false
        pinchStart = 0
        markDragEnd()
      } else if (pointers.size === 1) {
        const [p] = [...pointers.values()]
        lastX = p.x
        lastY = p.y
        dragging = true
        markDragStart()
      }
    }

    const onWheel = (e) => {
      e.preventDefault()
      const r = rig.current
      r.distT = clamp(r.distT + e.deltaY * 0.011, minDist, maxDist)
      r.yawT = clamp(r.yawT, -cfg.yawLimit, cfg.yawLimit)
    }

    const onLeave = () => {
      pointerState.down = false
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerleave', onLeave)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [gl, cfg, boost])

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta)
    const t = state.clock.elapsedTime
    const r = rig.current
    const k = 1 - Math.exp(-dt * 7)

    r.yaw += (r.yawT - r.yaw) * k
    r.pitch += (r.pitchT - r.pitch) * k
    r.dist += (r.distT - r.dist) * k
    r.sx += (pointerState.nx - r.sx) * (1 - Math.exp(-dt * 3))
    r.sy += (pointerState.ny - r.sy) * (1 - Math.exp(-dt * 3))

    const idle = reduced ? 0 : Math.sin(t * 0.16) * (cfg.auto > 0.03 ? 0.09 : 0.05)
    const yaw = r.yaw + r.arrival.yaw + idle + r.sx * 0.075
    const pitch = clamp(
      r.pitch + r.arrival.pitch - r.sy * 0.035,
      cfg.minPitch - 0.08,
      cfg.maxPitch + 0.08,
    )
    const dist = Math.max(3.4, r.dist + r.arrival.d)

    const tx = cfg.target[0] + r.sx * 0.55
    const ty = cfg.target[1] + r.arrival.lift - r.sy * 0.3
    const tz = cfg.target[2]

    const shake = reduced ? 0 : Math.sin(t * 0.42) * 0.035
    const camX = tx + dist * Math.cos(pitch) * Math.sin(yaw) + shake
    const camY = ty + dist * Math.sin(pitch) + Math.cos(t * 0.31) * 0.03
    const camZ = tz + dist * Math.cos(pitch) * Math.cos(yaw)

    camera.position.set(camX, camY, camZ)
    camera.lookAt(tx, ty, tz)
    if (import.meta.env.DEV) {
      window.__rig = { yaw, pitch, dist, arrivalYaw: r.arrival.yaw, arrivalDist: r.arrival.d }
    }
  })

  return null
}
