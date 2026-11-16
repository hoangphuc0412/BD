import * as THREE from 'three'

const cache = new Map()

function canvas2d(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function toTexture(canvas, { srgb = true, repeat = null } = {}) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = 4
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  t.needsUpdate = true
  return t
}

function memo(key, make) {
  if (!cache.has(key)) cache.set(key, make())
  return cache.get(key)
}

/** Soft radial glow — used for lights, sparks, moon halo. */
export const glowTexture = () =>
  memo('glow', () => {
    const [c, ctx] = canvas2d(256, 256)
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.18, 'rgba(255,246,240,0.92)')
    g.addColorStop(0.42, 'rgba(255,224,232,0.42)')
    g.addColorStop(0.7, 'rgba(240,180,200,0.12)')
    g.addColorStop(1, 'rgba(240,180,200,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return toTexture(c)
  })

/** Bokeh disc with a luminous rim. */
export const bokehTexture = () =>
  memo('bokeh', () => {
    const [c, ctx] = canvas2d(256, 256)
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 126)
    g.addColorStop(0, 'rgba(255,255,255,0.14)')
    g.addColorStop(0.55, 'rgba(255,240,245,0.09)')
    g.addColorStop(0.8, 'rgba(255,228,238,0.2)')
    g.addColorStop(0.93, 'rgba(255,214,228,0.08)')
    g.addColorStop(1, 'rgba(255,214,228,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(128, 128, 128, 0, Math.PI * 2)
    ctx.fill()
    return toTexture(c)
  })

/** Rose / cherry petal, white base so instance colours can tint it. */
export const petalTexture = () =>
  memo('petal', () => {
    const [c, ctx] = canvas2d(256, 256)
    ctx.clearRect(0, 0, 256, 256)
    ctx.save()
    ctx.translate(128, 128)
    ctx.beginPath()
    ctx.moveTo(0, -104)
    ctx.bezierCurveTo(88, -72, 96, 30, 0, 108)
    ctx.bezierCurveTo(-96, 30, -88, -72, 0, -104)
    ctx.closePath()
    const g = ctx.createLinearGradient(0, -104, 0, 108)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.42, 'rgba(255,241,246,0.98)')
    g.addColorStop(0.78, 'rgba(255,214,228,0.92)')
    g.addColorStop(1, 'rgba(248,186,206,0.78)')
    ctx.fillStyle = g
    ctx.shadowColor = 'rgba(255,220,232,0.55)'
    ctx.shadowBlur = 16
    ctx.fill()
    ctx.shadowBlur = 0
    // centre vein + soft folds
    ctx.strokeStyle = 'rgba(214,140,166,0.28)'
    ctx.lineWidth = 2.4
    ctx.beginPath()
    ctx.moveTo(0, -86)
    ctx.quadraticCurveTo(8, -10, 0, 92)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 1.3
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(0, -70)
      ctx.quadraticCurveTo(i * 30, 0, i * 7, 88)
      ctx.stroke()
    }
    ctx.restore()
    return toTexture(c)
  })

/** Single soft blossom / dust sprite. */
export const sparkTexture = () =>
  memo('spark', () => {
    const [c, ctx] = canvas2d(128, 128)
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.25, 'rgba(255,248,238,0.75)')
    g.addColorStop(0.6, 'rgba(255,222,200,0.18)')
    g.addColorStop(1, 'rgba(255,222,200,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return toTexture(c)
  })

/** Heart shaped sprite (used for floating glows + shutter effects). */
export const heartTexture = () =>
  memo('heartTex', () => {
    const [c, ctx] = canvas2d(256, 256)
    ctx.clearRect(0, 0, 256, 256)
    ctx.save()
    ctx.translate(128, 132)
    const path = () => {
      ctx.beginPath()
      ctx.moveTo(0, 74)
      ctx.bezierCurveTo(-96, 6, -70, -78, -22, -86)
      ctx.bezierCurveTo(-6, -88, 0, -72, 0, -58)
      ctx.bezierCurveTo(0, -72, 6, -88, 22, -86)
      ctx.bezierCurveTo(70, -78, 96, 6, 0, 74)
      ctx.closePath()
    }
    path()
    const g = ctx.createRadialGradient(-10, -30, 4, 0, 10, 110)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.45, 'rgba(255,226,235,0.96)')
    g.addColorStop(1, 'rgba(240,150,180,0.86)')
    ctx.fillStyle = g
    ctx.shadowColor = 'rgba(255,190,212,0.85)'
    ctx.shadowBlur = 22
    ctx.fill()
    ctx.restore()
    return toTexture(c)
  })

/** Dark, warm wood for the letter table. */
export const woodTexture = () =>
  memo('wood', () => {
    const [c, ctx] = canvas2d(1024, 1024)
    const base = ctx.createLinearGradient(0, 0, 1024, 1024)
    base.addColorStop(0, '#3a201b')
    base.addColorStop(0.45, '#2c1613')
    base.addColorStop(1, '#24100f')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, 1024, 1024)
    for (let i = 0; i < 220; i++) {
      const y = Math.random() * 1024
      const amp = 6 + Math.random() * 22
      ctx.strokeStyle = `rgba(${90 + Math.random() * 60}, ${40 + Math.random() * 30}, ${28 + Math.random() * 22}, ${0.05 + Math.random() * 0.12})`
      ctx.lineWidth = 0.8 + Math.random() * 2.6
      ctx.beginPath()
      ctx.moveTo(-20, y)
      for (let x = 0; x <= 1060; x += 40) {
        ctx.lineTo(x, y + Math.sin((x / 1024) * Math.PI * (1 + i % 4) + i) * amp)
      }
      ctx.stroke()
    }
    // knots
    for (let k = 0; k < 5; k++) {
      const x = Math.random() * 1024
      const y = Math.random() * 1024
      for (let r = 6; r < 42; r += 5) {
        ctx.strokeStyle = `rgba(20,8,6,${0.16 - r * 0.002})`
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.ellipse(x, y, r * 1.5, r, Math.random(), 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    const shade = ctx.createRadialGradient(512, 512, 120, 512, 512, 760)
    shade.addColorStop(0, 'rgba(255,190,140,0.06)')
    shade.addColorStop(1, 'rgba(0,0,0,0.45)')
    ctx.fillStyle = shade
    ctx.fillRect(0, 0, 1024, 1024)
    return toTexture(c, { repeat: [1.6, 1.6] })
  })

/** Creamy paper with fibres — used on the letter sheet glow + panels. */
export const paperTexture = () =>
  memo('paper', () => {
    const [c, ctx] = canvas2d(512, 512)
    ctx.fillStyle = '#f7ece0'
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 5200; i++) {
      ctx.fillStyle = `rgba(${140 + Math.random() * 60}, ${110 + Math.random() * 50}, ${90 + Math.random() * 40}, ${Math.random() * 0.06})`
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.6, 1.6)
    }
    const v = ctx.createRadialGradient(256, 220, 60, 256, 256, 380)
    v.addColorStop(0, 'rgba(255,255,255,0.25)')
    v.addColorStop(1, 'rgba(160,120,90,0.16)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, 512, 512)
    return toTexture(c)
  })

/** Marquina-ish marble for the celebration stage. */
export const marbleTexture = () =>
  memo('marble', () => {
    const [c, ctx] = canvas2d(1024, 1024)
    const g = ctx.createRadialGradient(400, 380, 40, 512, 512, 720)
    g.addColorStop(0, '#3a1526')
    g.addColorStop(0.55, '#240c18')
    g.addColorStop(1, '#12050d')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 1024)
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = `rgba(240,210,190,${0.03 + Math.random() * 0.06})`
      ctx.lineWidth = 0.6 + Math.random() * 1.8
      ctx.beginPath()
      let x = Math.random() * 1024
      let y = Math.random() * 1024
      ctx.moveTo(x, y)
      for (let s = 0; s < 14; s++) {
        x += (Math.random() - 0.5) * 160
        y += (Math.random() - 0.5) * 160
        ctx.quadraticCurveTo(x + 30, y - 20, x, y)
      }
      ctx.stroke()
    }
    return toTexture(c)
  })

/** Caption printed below each polaroid. */
export function captionTexture(caption, date) {
  const key = `cap:${caption}:${date}`
  return memo(key, () => {
    const [c, ctx] = canvas2d(1024, 300)
    ctx.clearRect(0, 0, 1024, 300)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(84, 44, 58, 0.92)'
    ctx.font = 'italic 500 62px "Cormorant Garamond", Georgia, serif'
    const words = caption.split(' ')
    const lines = []
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width > 880 && line) {
        lines.push(line)
        line = w
      } else line = test
    }
    if (line) lines.push(line)
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 512, 88 + i * 70))
    ctx.fillStyle = 'rgba(160, 118, 128, 0.95)'
    ctx.font = '400 34px Raleway, sans-serif'
    ctx.fillText(date.toUpperCase().split('').join(' '), 512, 236)
    return toTexture(c)
  })
}

/** Soft elliptical shadow used under the gift & cake (cheaper than shadow maps). */
export const shadowTexture = () =>
  memo('shadow', () => {
    const [c, ctx] = canvas2d(256, 256)
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(0.5, 'rgba(0,0,0,0.28)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return toTexture(c)
  })

/** Dreamy stand-in shown until a real photo loads (or if it is missing). */
export function placeholderPhotoTexture(seed = 0) {
  return memo(`ph:${seed}`, () => {
    const [c, ctx] = canvas2d(900, 900)
    const palettes = [
      ['#f7cfd9', '#c95f80', '#54213a'],
      ['#f2d7c4', '#c98d6a', '#3e1d2c'],
      ['#e8c4d4', '#9a5478', '#2c1322'],
      ['#f7e3d0', '#d6a68c', '#4a2233'],
    ]
    const p = palettes[seed % palettes.length]
    const g = ctx.createLinearGradient(0, 0, 900, 900)
    g.addColorStop(0, p[0])
    g.addColorStop(0.55, p[1])
    g.addColorStop(1, p[2])
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 900, 900)
    const gl = ctx.createRadialGradient(270, 300, 20, 270, 300, 560)
    gl.addColorStop(0, 'rgba(255,244,238,0.85)')
    gl.addColorStop(0.5, 'rgba(255,220,232,0.18)')
    gl.addColorStop(1, 'rgba(40,10,24,0.45)')
    ctx.fillStyle = gl
    ctx.fillRect(0, 0, 900, 900)
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 900
      const y = Math.random() * 900
      ctx.beginPath()
      ctx.arc(x, y, Math.random() * 2.2 + 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,245,240,${Math.random() * 0.5})`
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(255,246,238,0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(26, 26, 848, 848)
    ctx.fillStyle = 'rgba(255,248,240,0.92)'
    ctx.textAlign = 'center'
    ctx.font = 'italic 400 54px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('our little moment', 450, 690)
    ctx.font = '400 26px Raleway, sans-serif'
    ctx.fillText('THÊM ẢNH CỦA BẠN VÀO PUBLIC/PHOTOS', 450, 750)
    return toTexture(c)
  })
}

export function sceneBackdropTexture() {
  return memo('backdrop', () => {
    const [c, ctx] = canvas2d(1024, 1024)
    const g = ctx.createRadialGradient(512, 620, 40, 512, 560, 760)
    g.addColorStop(0, '#4d1230')
    g.addColorStop(0.35, '#2c0a1c')
    g.addColorStop(0.72, '#190611')
    g.addColorStop(1, '#0d0309')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 1024)
    return toTexture(c)
  })
}
