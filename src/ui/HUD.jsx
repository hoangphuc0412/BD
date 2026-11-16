import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { content } from '../config/content'
import { audio } from '../lib/audio'

function MusicIcon({ on }) {
  return (
    <span className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="eq-bar w-[2px] rounded-full bg-champagne"
          style={{
            height: `${[40, 85, 60, 100][i]}%`,
            animationPlayState: on ? 'running' : 'paused',
            animationDelay: `${i * 0.14}s`,
            opacity: on ? 1 : 0.35,
          }}
        />
      ))}
    </span>
  )
}

export default function HUD() {
  const giftOpened = useStore((s) => s.giftOpened)
  const scene = useStore((s) => s.scene)
  const setScene = useStore((s) => s.setScene)
  const musicOn = useStore((s) => s.musicOn)
  const setMusic = useStore((s) => s.setMusic)
  const letterOpen = useStore((s) => s.letterOpen)
  const photoIndex = useStore((s) => s.photoIndex)

  const items = content.navigation
  const activeIndex = Math.max(0, items.findIndex((i) => i.id === scene))

  const toggleMusic = () => {
    if (musicOn) {
      audio.stopMusic()
      setMusic(false)
    } else {
      audio.ensure()
      audio.startMusic()
      setMusic(true)
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (!giftOpened) return
      if (letterOpen || photoIndex !== null) return
      if (e.key === 'ArrowRight' && activeIndex < items.length - 1) {
        setScene(items[activeIndex + 1].id)
      } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
        setScene(items[activeIndex - 1].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [giftOpened, activeIndex, items, setScene, letterOpen, photoIndex])

  return (
    <AnimatePresence>
      {giftOpened && scene !== 'gift' && (
        <>
          <motion.header
            key="hud-top"
            className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between px-5 pt-5 sm:px-8 sm:pt-7"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1.1, delay: 0.4 } }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.6 } }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative grid h-11 w-11 place-items-center rounded-full border border-champagne/30 bg-ink/30 backdrop-blur-md sm:h-12 sm:w-12">
                <span className="font-script text-lg text-champagne sm:text-xl">
                  {content.sender.initial}
                  <span className="mx-[1px] text-[0.65em] text-blush/70">&</span>
                  {content.her.initial}
                </span>
                <span className="absolute inset-0 rounded-full border border-blush/10" />
              </div>
              <div className="leading-tight">
                <p className="font-script text-xl text-pearl/90 sm:text-2xl">{content.her.name}</p>
                <p className="mt-1 text-[7px] uppercase tracking-[0.34em] text-champagne/55 sm:text-[8px]">
                  Our little universe · {content.birthday.label}
                </p>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-3">
              <div className="hidden flex-col items-end sm:flex">
                <span className="font-serif text-lg italic text-blush/70">{content.music.title}</span>
                <span className="text-[7px] uppercase tracking-[0.3em] text-pearl/35">
                  {musicOn ? content.hud.musicOn : content.hud.musicOff}
                </span>
              </div>
              <button
                onClick={toggleMusic}
                aria-label={musicOn ? 'Tắt nhạc' : 'Bật nhạc'}
                className="group relative grid h-11 w-11 place-items-center rounded-full border border-pearl/15 bg-white/5 backdrop-blur-md transition-all duration-500 hover:border-champagne/50 hover:bg-white/10"
              >
                <MusicIcon on={musicOn} />
                {!musicOn && (
                  <span className="absolute inset-0 animate-soft-pulse rounded-full border border-champagne/15" />
                )}
              </button>
            </div>
          </motion.header>

          <motion.div
            key="hud-nav"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2.5 pb-safe"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1.1, delay: 0.7 } }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.6 } }}
          >
            <nav className="glass pointer-events-auto flex items-center gap-0.5 rounded-full p-1.5 sm:gap-1">
              {items.map((item, i) => {
                const active = item.id === scene
                return (
                  <button
                    key={item.id}
                    onClick={() => setScene(item.id)}
                    aria-label={item.label}
                    aria-current={active ? 'true' : undefined}
                    data-active={active}
                    className={`nav-dot flex items-center gap-2 rounded-full px-3 py-2 transition-colors duration-500 sm:px-4 ${
                      active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                        active ? 'bg-champagne shadow-[0_0_10px_2px_rgba(227,194,151,0.55)]' : 'bg-pearl/30'
                      }`}
                    />
                    <span
                      className={`text-[8px] uppercase tracking-[0.24em] transition-colors duration-500 ${
                        active ? 'text-champagne' : 'text-pearl/45 group-hover:text-pearl/70'
                      } ${active ? 'inline' : 'hidden min-[440px]:inline'}`}
                    >
                      {item.short}
                    </span>
                    <span className="hidden text-[7px] tracking-[0.2em] text-pearl/25 lg:inline">
                      0{i + 1}
                    </span>
                  </button>
                )
              })}
            </nav>
            <p className="hidden text-[8px] uppercase tracking-[0.3em] text-pearl/25 sm:block">
              {content.hud.hint}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
