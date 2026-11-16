import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { content } from '../config/content'
import { audio } from '../lib/audio'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 1.2, delay: d, ease: [0.22, 1, 0.36, 1] } }),
}

export default function IntroOverlay() {
  const giftOpened = useStore((s) => s.giftOpened)
  const openGift = useStore((s) => s.openGift)
  const setMusic = useStore((s) => s.setMusic)
  const [entering, setEntering] = useState(false)

  const handleOpen = () => {
    audio.ensure()
    audio.sfx('gift')
    audio.startMusic()
    setMusic(true)
    openGift()
    setEntering(true)
    setTimeout(() => setEntering(false), 4200)
  }

  return (
    <>
      <AnimatePresence>
        {!giftOpened && (
          <motion.div
            key="intro"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-6 pb-10 sm:pb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.6, delay: 0.3 } }}
            exit={{ opacity: 0, y: 24, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } }}
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
            <div className="relative flex flex-col items-center text-center">
              <motion.p
                variants={fadeUp}
                custom={0.5}
                initial="hidden"
                animate="show"
                className="font-script text-xl text-blush/80 sm:text-2xl"
              >
                {content.intro.line1}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                custom={0.85}
                initial="hidden"
                animate="show"
                className="text-rose-gradient animate-shimmer font-script mt-1 text-[2.2rem] leading-tight sm:text-[3.4rem]"
              >
                {content.intro.line2}
              </motion.h2>
              <motion.div variants={fadeUp} custom={1.25} initial="hidden" animate="show" className="mt-6">
                <button className="btn-luxe pointer-events-auto !px-8 !py-3.5 !text-[0.65rem] sm:!px-10" onClick={handleOpen}>
                  <span className="text-[10px]">✦</span>
                  {content.intro.button}
                  <span className="text-[10px]">✦</span>
                </button>
              </motion.div>
              <motion.p
                variants={fadeUp}
                custom={1.6}
                initial="hidden"
                animate="show"
                className="mt-4 max-w-sm font-serif text-[10px] uppercase leading-relaxed tracking-[0.24em] text-pearl/40"
              >
                {content.intro.hint}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entering && (
          <motion.div
            key="entering"
            className="pointer-events-none fixed inset-0 z-40 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 1.6 } }}
          >
            <p className="font-script text-3xl text-blush/90 drop-shadow-[0_0_30px_rgba(255,160,190,0.55)] sm:text-5xl">
              Come with me…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
