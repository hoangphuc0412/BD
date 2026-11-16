import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../config/content'

const petals = Array.from({ length: 14 }, (_, i) => ({
  left: 6 + ((i * 37) % 88),
  top: 8 + ((i * 53) % 80),
  size: 3 + (i % 4) * 2,
  delay: (i % 7) * 0.7,
  dur: 7 + (i % 5) * 2,
}))

export default function LoadingScreen({ visible, progress }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-veil fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } }}
        >
          {petals.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-blush/40 blur-[1px]"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                animation: `floatY ${p.dur}s ease-in-out ${p.delay}s infinite, softPulse ${p.dur * 0.8}s ease-in-out infinite`,
                opacity: 0.5,
              }}
            />
          ))}

          <div className="relative flex flex-col items-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <p className="font-script text-xl text-champagne/75">for {content.her.name}</p>
              <h1 className="mt-4 font-display text-4xl font-light tracking-[0.22em] text-pearl/90 sm:text-6xl">
                OUR LITTLE
              </h1>
              <h1 className="text-rose-gradient font-script -mt-1 text-5xl leading-[1.1] sm:text-8xl">
                Universe
              </h1>
            </motion.div>

            <div className="mt-12 w-56 sm:w-72">
              <div className="relative h-px w-full overflow-hidden bg-pearl/10">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-champagne to-blush transition-[width] duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-[8px] uppercase tracking-[0.32em] text-pearl/40">
                <span>{content.loading.line2}</span>
                <span className="text-champagne/60">{Math.round(progress)}%</span>
              </div>
            </div>

            <p className="mt-16 animate-soft-pulse font-script text-2xl text-blush/55">a world made of us</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
