import { useEffect, useState } from 'react'
import SceneCanvas from './three/SceneCanvas'
import LoadingScreen from './ui/LoadingScreen'
import IntroOverlay from './ui/IntroOverlay'
import HUD from './ui/HUD'
import SceneOverlays from './ui/SceneOverlays'
import MessageToast from './ui/MessageToast'
import LetterModal from './ui/LetterModal'
import PhotoLightbox from './ui/PhotoLightbox'
import SceneFlash from './ui/SceneFlash'
import { useStore } from './lib/store'
import { content } from './config/content'

const FONT_LOADS = [
  '300 1em "Cormorant Garamond"',
  'italic 400 1em "Cormorant Garamond"',
  '500 1em "Cormorant Garamond"',
  '400 1em "Great Vibes"',
  '400 1em "Raleway"',
  '500 1em "Raleway"',
].map((f) => (document.fonts?.load ? document.fonts.load(f) : Promise.resolve()))

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = resolve
    img.src = src
  })

export default function App() {
  const loaded = useStore((s) => s.loaded)
  const finishLoading = useStore((s) => s.finishLoading)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    let settled = 0
    let finished = false
    const start = performance.now()
    const MIN = 2600

    const assets = [
      ...FONT_LOADS,
      document.fonts?.ready ?? Promise.resolve(),
      ...content.memories.photos.map((p) => loadImage(p.src)),
    ]
    const total = assets.length
    const settle = () => {
      settled += 1
    }
    assets.forEach((p) => Promise.resolve(p).then(settle, settle))

    const finish = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)
      setProgress(100)
      setTimeout(() => finishLoading(), 260)
    }

    const loop = (now) => {
      const elapsed = now - start
      const assetRatio = settled / total
      const timeRatio = Math.min(1, elapsed / MIN)
      const shown = Math.min(1, timeRatio * 0.72 + assetRatio * 0.28)
      setProgress((prev) => Math.max(prev, Math.min(97, shown * 100)))
      if (assetRatio >= 1 && elapsed >= MIN) {
        finish()
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const safety = setTimeout(finish, 10000)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
    }
  }, [finishLoading])

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink">
      <SceneCanvas />

      <div className="cinema-vignette" />
      <div className="film-grain" />

      <SceneFlash />
      <SceneOverlays />
      <HUD />
      <MessageToast />
      <IntroOverlay />
      <LetterModal />
      <PhotoLightbox />

      <LoadingScreen visible={!loaded} progress={progress} />
    </div>
  )
}
