import { content } from '../config/content'

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)

/**
 * A tiny generative piano + SFX engine built on Web Audio.
 * No audio files needed — the soundtrack is played live, softly,
 * and only after the first user gesture.
 */
class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.musicBus = null
    this.sfxBus = null
    this.reverb = null
    this.reverbSend = null
    this.noiseBuffer = null
    this.playing = false
    this.timer = null
    this.nextBarTime = 0
    this.barIndex = 0
    this.htmlAudio = null
    this.volume = content.music.volume ?? 0.4
  }

  ensure() {
    if (typeof window === 'undefined') return null
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {})
      return this.ctx
    }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    try {
      const ctx = new Ctx()
      const master = ctx.createGain()
      master.gain.value = 0.85

      const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -14
      limiter.knee.value = 18
      limiter.ratio.value = 3
      limiter.attack.value = 0.006
      limiter.release.value = 0.32

      master.connect(limiter).connect(ctx.destination)

      const convolver = ctx.createConvolver()
      convolver.buffer = this.makeImpulse(ctx, 3.4, 2.6)
      const wet = ctx.createGain()
      wet.gain.value = 0.5
      convolver.connect(wet).connect(master)

      const musicBus = ctx.createGain()
      musicBus.gain.value = 0
      const musicTone = ctx.createBiquadFilter()
      musicTone.type = 'lowpass'
      musicTone.frequency.value = 6400
      musicBus.connect(musicTone)
      musicTone.connect(master)
      musicTone.connect(convolver)

      const sfxBus = ctx.createGain()
      sfxBus.gain.value = 0.9
      sfxBus.connect(master)
      const sfxWet = ctx.createGain()
      sfxWet.gain.value = 0.35
      sfxBus.connect(sfxWet).connect(convolver)

      this.ctx = ctx
      this.master = master
      this.musicBus = musicBus
      this.sfxBus = sfxBus
      this.reverb = convolver
      this.noiseBuffer = this.makeNoise(ctx, 2.4)
      return ctx
    } catch {
      return null
    }
  }

  makeImpulse(ctx, seconds, decay) {
    const rate = ctx.sampleRate
    const len = Math.floor(rate * seconds)
    const buf = ctx.createBuffer(2, len, rate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) {
        const fadeIn = Math.min(1, i / (rate * 0.015))
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay) * fadeIn
      }
    }
    return buf
  }

  makeNoise(ctx, seconds) {
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    return buf
  }

  /* ────────────────────────── piano ────────────────────────── */

  note(midi, when, dur = 3, vel = 0.14, bus) {
    const ctx = this.ctx
    if (!ctx) return
    const f = mtof(midi)
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, when)
    out.gain.exponentialRampToValueAtTime(Math.max(0.0002, vel), when + 0.012)
    out.gain.exponentialRampToValueAtTime(Math.max(0.00005, vel * 0.24), when + dur * 0.35)
    out.gain.exponentialRampToValueAtTime(0.00002, when + dur)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.Q.value = 0.35
    lp.frequency.setValueAtTime(Math.min(11000, f * 14), when)
    lp.frequency.exponentialRampToValueAtTime(Math.max(700, f * 2.6), when + dur * 0.9)
    out.connect(lp).connect(bus || this.musicBus)

    const partials = [
      [1, 0.52, 'sine'],
      [1.002, 0.24, 'triangle'],
      [2.004, 0.13, 'sine'],
      [3.01, 0.045, 'sine'],
      [4.02, 0.022, 'sine'],
    ]
    for (const [mult, amp, type] of partials) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = f * mult
      const g = ctx.createGain()
      g.gain.value = amp
      o.connect(g).connect(out)
      o.start(when)
      o.stop(when + dur + 0.05)
    }
  }

  bell(midi, when, dur = 1.4, vel = 0.06) {
    const ctx = this.ctx
    if (!ctx) return
    const f = mtof(midi)
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, when)
    out.gain.exponentialRampToValueAtTime(vel, when + 0.006)
    out.gain.exponentialRampToValueAtTime(0.00002, when + dur)
    out.connect(this.sfxBus)
    for (const [mult, amp] of [
      [1, 1],
      [2.01, 0.34],
      [3.98, 0.12],
      [5.4, 0.045],
    ]) {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * mult
      const g = ctx.createGain()
      g.gain.value = amp
      o.connect(g).connect(out)
      o.start(when)
      o.stop(when + dur)
    }
  }

  noise(when, dur, { type = 'bandpass', from = 1200, to = 400, q = 0.8, gain = 0.2, attack = 0.02 } = {}) {
    const ctx = this.ctx
    if (!ctx || !this.noiseBuffer) return
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.Q.value = q
    filter.frequency.setValueAtTime(from, when)
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, to), when + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, when)
    g.gain.exponentialRampToValueAtTime(gain, when + attack)
    g.gain.exponentialRampToValueAtTime(0.00005, when + dur)
    src.connect(filter).connect(g).connect(this.sfxBus)
    src.start(when)
    src.stop(when + dur + 0.05)
  }

  /* ────────────────────────── soundtrack ────────────────────────── */

  startMusic() {
    const ctx = this.ensure()
    if (!ctx) return

    if (content.music.src) {
      if (!this.htmlAudio) {
        this.htmlAudio = new Audio(content.music.src)
        this.htmlAudio.loop = true
        this.htmlAudio.volume = 0
      }
      const el = this.htmlAudio
      el.play()
        .then(() => this.fadeHtml(el.volume, this.volume, 2400))
        .catch(() => {})
      return
    }

    if (this.playing) return
    this.playing = true
    this.barIndex = 0
    const now = ctx.currentTime
    this.nextBarTime = now + 0.25
    this.musicBus.gain.cancelScheduledValues(now)
    this.musicBus.gain.setValueAtTime(Math.max(0.0001, this.musicBus.gain.value), now)
    this.musicBus.gain.linearRampToValueAtTime(0.95, now + 3.2)
    this.timer = setInterval(() => this.tick(), 140)
    this.tick()
  }

  stopMusic() {
    if (this.htmlAudio) {
      const el = this.htmlAudio
      this.fadeHtml(el.volume, 0, 1200, () => el.pause())
    }
    if (!this.playing || !this.ctx) return
    const now = this.ctx.currentTime
    this.musicBus.gain.cancelScheduledValues(now)
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, now)
    this.musicBus.gain.linearRampToValueAtTime(0.0001, now + 1.4)
    this.playing = false
    clearInterval(this.timer)
    this.timer = null
  }

  fadeHtml(from, to, ms, done) {
    const el = this.htmlAudio
    if (!el) return
    const start = performance.now()
    const step = (t) => {
      const p = Math.min(1, (t - start) / ms)
      el.volume = Math.max(0, Math.min(1, from + (to - from) * p))
      if (p < 1) requestAnimationFrame(step)
      else done?.()
    }
    requestAnimationFrame(step)
  }

  tick() {
    if (!this.playing || !this.ctx) return
    const ctx = this.ctx
    const beat = 60 / 57
    const barDur = beat * 4
    if (this.nextBarTime < ctx.currentTime - 2) this.nextBarTime = ctx.currentTime + 0.1
    while (this.nextBarTime < ctx.currentTime + 1.4) {
      this.playBar(this.barIndex, this.nextBarTime, beat)
      this.barIndex = (this.barIndex + 1) % BARS.length
      this.nextBarTime += barDur
    }
  }

  playBar(index, t, beat) {
    const bar = BARS[index]
    const bus = this.musicBus
    const humanize = () => (Math.random() - 0.5) * 0.02

    this.note(bar.bass, t + humanize(), 5.4, 0.16, bus)
    this.note(bar.bass + 12, t + 0.02 + humanize(), 4.2, 0.055, bus)

    const pattern = index % 2 === 0 ? ARP_A : ARP_B
    pattern.forEach(([step, idx, vel], i) => {
      if (i % 3 === 2 && Math.random() < 0.28) return
      const midi = bar.notes[idx % bar.notes.length]
      this.note(midi, t + step * beat + humanize(), 3.4, vel, bus)
    })

    if (Math.random() < 0.62) {
      const mel = MELODY[Math.floor(Math.random() * MELODY.length)]
      this.note(mel, t + (2.6 + Math.random() * 0.9) * beat, 3.8, 0.075, bus)
    }
  }

  /* ────────────────────────── SFX ────────────────────────── */

  sfx(name) {
    const ctx = this.ensure()
    if (!ctx) return
    const t = ctx.currentTime + 0.01
    switch (name) {
      case 'click':
        this.bell(88, t, 0.5, 0.05)
        this.bell(95, t + 0.03, 0.35, 0.02)
        break
      case 'hover':
        this.bell(93, t, 0.22, 0.014)
        break
      case 'heart':
        this.bell(76, t, 1.1, 0.05)
        this.bell(83, t + 0.09, 1.3, 0.04)
        break
      case 'gift': {
        this.noise(t, 1.5, { type: 'bandpass', from: 320, to: 4200, q: 0.7, gain: 0.12, attack: 0.25 })
        const rise = [72, 76, 79, 84, 88, 91, 96]
        rise.forEach((m, i) => this.bell(m, t + 0.18 + i * 0.1, 1.8, 0.05))
        this.noise(t + 0.1, 0.9, { type: 'lowpass', from: 220, to: 60, q: 0.6, gain: 0.2, attack: 0.05 })
        break
      }
      case 'paper':
        this.noise(t, 0.55, { type: 'bandpass', from: 900, to: 2800, q: 1.4, gain: 0.1 })
        this.noise(t + 0.18, 0.7, { type: 'bandpass', from: 2200, to: 700, q: 0.9, gain: 0.06 })
        this.bell(79, t + 0.3, 1.2, 0.03)
        break
      case 'seal':
        this.bell(63, t, 0.5, 0.07)
        this.noise(t, 0.25, { type: 'lowpass', from: 800, to: 200, gain: 0.06 })
        break
      case 'blow':
        this.noise(t, 1.5, { type: 'lowpass', from: 1500, to: 160, q: 0.6, gain: 0.26, attack: 0.06 })
        this.noise(t + 0.05, 1.1, { type: 'bandpass', from: 600, to: 200, q: 0.8, gain: 0.1 })
        this.bell(60, t + 0.1, 2.6, 0.03)
        break
      case 'firework': {
        this.noise(t, 0.5, { type: 'highpass', from: 1800, to: 400, q: 0.5, gain: 0.12, attack: 0.005 })
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(140, t)
        o.frequency.exponentialRampToValueAtTime(38, t + 0.7)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.01)
        g.gain.exponentialRampToValueAtTime(0.00002, t + 0.9)
        o.connect(g).connect(this.sfxBus)
        o.start(t)
        o.stop(t + 1)
        break
      }
      case 'wish': {
        this.noise(t, 2.6, { type: 'bandpass', from: 260, to: 5600, q: 0.6, gain: 0.13, attack: 0.9 })
        const shimmer = [84, 87, 91, 96, 99, 103]
        shimmer.forEach((m, i) => this.bell(m, t + 0.4 + i * 0.16, 2.8, 0.042))
        this.note(48, t + 0.1, 6, 0.1, this.sfxBus)
        this.note(55, t + 0.2, 6, 0.08, this.sfxBus)
        this.note(60, t + 0.3, 6, 0.06, this.sfxBus)
        break
      }
      case 'sparkle':
        this.bell(96, t, 0.9, 0.02)
        this.bell(103, t + 0.07, 0.7, 0.014)
        break
      default:
        this.bell(88, t, 0.4, 0.04)
    }
  }
}

const BARS = [
  { bass: 44, notes: [51, 56, 60, 63, 67, 70] },
  { bass: 41, notes: [48, 53, 56, 60, 63, 67] },
  { bass: 37, notes: [44, 49, 53, 56, 60, 63] },
  { bass: 39, notes: [44, 51, 55, 58, 63, 67] },
  { bass: 44, notes: [51, 56, 60, 63, 67, 72] },
  { bass: 36, notes: [43, 48, 51, 55, 60, 63] },
  { bass: 37, notes: [44, 49, 56, 60, 63, 68] },
  { bass: 39, notes: [46, 51, 55, 58, 63, 67] },
]

// [beatOffset, chordIndex, velocity]
const ARP_A = [
  [0, 2, 0.1],
  [0.5, 3, 0.075],
  [1, 4, 0.085],
  [1.5, 5, 0.06],
  [2, 4, 0.07],
  [2.5, 3, 0.065],
  [3, 2, 0.06],
  [3.5, 4, 0.055],
]
const ARP_B = [
  [0, 3, 0.09],
  [0.75, 4, 0.07],
  [1.5, 5, 0.065],
  [2, 3, 0.06],
  [2.75, 2, 0.055],
  [3.5, 5, 0.05],
]

const MELODY = [70, 72, 75, 77, 79, 82, 84, 87]

export const audio = new AudioEngine()
