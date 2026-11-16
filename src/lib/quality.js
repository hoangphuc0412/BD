export const QUALITY_PRESETS = {
  high: {
    dpr: [1, 1.8],
    stars: 2800,
    petals: 380,
    bokeh: 46,
    blossoms: 780,
    fireflies: 130,
    reflections: true,
    dof: true,
    contactShadows: 1024,
    fireworkParticles: 240,
    risingHearts: 220,
  },
  balanced: {
    dpr: [1, 1.5],
    stars: 1700,
    petals: 260,
    bokeh: 30,
    blossoms: 600,
    fireflies: 85,
    reflections: false,
    dof: false,
    contactShadows: 512,
    fireworkParticles: 170,
    risingHearts: 150,
  },
  low: {
    dpr: [1, 1.15],
    stars: 900,
    petals: 130,
    bokeh: 18,
    blossoms: 380,
    fireflies: 50,
    reflections: false,
    dof: false,
    contactShadows: 0,
    fireworkParticles: 110,
    risingHearts: 90,
  },
}

export function detectQuality() {
  if (typeof window === 'undefined') return 'high'
  const ua = navigator.userAgent
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const mobile = /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(ua) || (coarse && window.innerWidth < 1024)
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4
  const small = window.innerWidth < 720

  if (coreLess(cores) || mem <= 3) return 'low'
  if (mobile || small || cores <= 4) return 'balanced'
  return 'high'
}

const coreLess = (c) => c <= 2

let glRenderer = null
export function getRendererInfo() {
  if (glRenderer) return glRenderer
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    glRenderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''
  } catch {
    glRenderer = ''
  }
  return glRenderer
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
