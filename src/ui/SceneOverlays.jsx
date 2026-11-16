import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { content } from '../config/content'
import { audio } from '../lib/audio'

const fade = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.6 } },
}

function SceneHeading({ kicker, title, subtitle, center = true }) {
  return (
    <motion.div
      {...fade}
      className={`pointer-events-none absolute inset-x-0 top-[4.6rem] flex flex-col px-6 sm:top-[5.4rem] ${
        center ? 'items-center text-center' : 'items-start'
      }`}
    >
      <p className="text-[7px] uppercase tracking-[0.5em] text-champagne/55 sm:text-[8px]">{kicker}</p>
      <h2 className="mt-2 font-serif text-[1.55rem] italic leading-none text-pearl/90 drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-[2.1rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 font-sans text-[8px] uppercase tracking-[0.3em] text-pearl/35 sm:text-[9px]">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

function HintChip({ children }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 8000)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0, transition: { duration: 1.4, delay: visible ? 0.9 : 0 } }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center px-6 sm:bottom-32"
    >
      <span className="glass rounded-full px-4 py-2 text-center text-[8px] uppercase tracking-[0.28em] text-pearl/50 sm:text-[9px]">
        {children}
      </span>
    </motion.div>
  )
}

function GardenOverlay() {
  return (
    <>
      <SceneHeading
        kicker="Act I · Our Universe"
        title={content.garden.title}
        subtitle={content.garden.subtitle}
      />
      <HintChip>{content.garden.hint}</HintChip>
    </>
  )
}

function LetterOverlay() {
  const letterOpened = useStore((s) => s.letterOpened)
  const setLetterOpen = useStore((s) => s.setLetterOpen)

  const reopen = () => {
    audio.sfx('paper')
    setLetterOpen(true)
  }

  return (
    <>
      <SceneHeading
        kicker="Act II · A Letter"
        title={content.letter.title}
        subtitle={content.letter.subtitle}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-28 flex flex-col items-center gap-3 px-6 sm:bottom-32">
        <AnimatePresence mode="wait">
          {letterOpened ? (
            <motion.button
              key="reopen"
              onClick={reopen}
              className="btn-ghost pointer-events-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              Đọc lại lá thư
            </motion.button>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 1.6, delay: 0.9 } }}
              exit={{ opacity: 0 }}
              className="glass rounded-full px-4 py-2 text-center text-[8px] uppercase tracking-[0.28em] text-pearl/50 sm:text-[9px]"
            >
              {content.letter.hint}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

function MemoriesOverlay() {
  return (
    <>
      <SceneHeading
        kicker="Act III · Memories"
        title={content.memories.title}
        subtitle={content.memories.subtitle}
      />
      <HintChip>{content.memories.hint}</HintChip>
    </>
  )
}

function CelebrationOverlay() {
  const wishMade = useStore((s) => s.wishMade)
  const makeWish = useStore((s) => s.makeWish)
  const restart = useStore((s) => s.restart)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(false)
  }, [wishMade])

  const handleWish = () => {
    audio.ensure()
    audio.sfx('blow')
    setTimeout(() => audio.sfx('wish'), 650)
    setTimeout(() => audio.sfx('firework'), 1400)
    makeWish()
  }

  return (
    <>
      {(!wishMade || dismissed) && (
        <motion.div {...fade} className="pointer-events-none absolute inset-x-0 top-[4.4rem] flex flex-col items-center px-6 text-center sm:top-[5rem]">
          <p className="text-[7px] uppercase tracking-[0.5em] text-champagne/55 sm:text-[8px]">
            Act IV · Celebration
          </p>
          <h2 className="mt-2 font-hand text-[2.1rem] leading-none text-blush/90 drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)] sm:text-[3rem]">
            {content.celebration.title1}
          </h2>
          <h3 className="mt-1 font-serif text-[1.5rem] uppercase leading-none tracking-[0.3em] text-gold-gradient sm:text-[2.1rem]">
            {content.celebration.title2}
          </h3>
          <p className="mt-2.5 font-sans text-[8px] uppercase tracking-[0.28em] text-pearl/35 sm:text-[9px]">
            {content.celebration.subtitle}
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {!wishMade && (
          <motion.div
            key="wish-btn"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1.2, delay: 0.8 } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.5 } }}
            className="pointer-events-none absolute inset-x-0 bottom-28 flex flex-col items-center gap-3.5 px-6 sm:bottom-32"
          >
            <p className="text-[8px] uppercase tracking-[0.3em] text-pearl/40">{content.celebration.wishHint}</p>
            <button onClick={handleWish} className="btn-luxe pointer-events-auto animate-soft-pulse">
              {content.celebration.wishButton}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wishMade && !dismissed && (
          <motion.div
            key="wish-done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.6, delay: 1.1 } }}
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end bg-gradient-to-t from-ink/90 via-ink/35 to-transparent pb-28 sm:pb-32"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,rgba(9,2,7,0.55)_0%,transparent_62%)]" />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1.6, delay: 1.5, ease: [0.22, 1, 0.36, 1] } }}
              className="relative z-10 flex flex-col items-center px-6 text-center"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="gold-hairline w-10 sm:w-16" />
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-rose/80">
                  <path d="M12 21s-7.5-4.7-9.6-9A5.7 5.7 0 0 1 12 6a5.7 5.7 0 0 1 9.6 6c-2.1 4.3-9.6 9-9.6 9Z" />
                </svg>
                <span className="gold-hairline w-10 sm:w-16" />
              </div>
              <p className="font-hand text-[1.9rem] leading-tight text-pearl drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] sm:text-[2.7rem]">
                {content.celebration.wishMessage}
              </p>
              <p className="mt-3 font-serif text-[1.05rem] italic text-blush/85 sm:text-[1.35rem]">
                {content.celebration.wishMessage2}
              </p>
              <p className="mt-4 max-w-sm font-sans text-[9px] uppercase leading-relaxed tracking-[0.24em] text-pearl/35">
                {content.celebration.finalNote}
              </p>
              <div className="pointer-events-auto mt-7 flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => setDismissed(true)} className="btn-ghost">
                  {content.celebration.stay}
                </button>
                <button onClick={restart} className="btn-luxe">
                  {content.celebration.replay}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wishMade && dismissed && (
          <motion.div
            key="wish-again"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center sm:bottom-32"
          >
            <button
              onClick={() => setDismissed(false)}
              className="glass pointer-events-auto rounded-full px-4 py-2 text-[8px] uppercase tracking-[0.28em] text-champagne/70 transition hover:text-champagne sm:text-[9px]"
            >
              Xem lại lời chúc
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function SceneOverlays() {
  const scene = useStore((s) => s.scene)
  const epoch = useStore((s) => s.epoch)
  const giftOpened = useStore((s) => s.giftOpened)

  if (!giftOpened) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <AnimatePresence mode="wait">
        <motion.div key={`${scene}-${epoch}`} className="absolute inset-0" initial={false}>
          {scene === 'garden' && <GardenOverlay />}
          {scene === 'letter' && <LetterOverlay />}
          {scene === 'memories' && <MemoriesOverlay />}
          {scene === 'celebration' && <CelebrationOverlay />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
