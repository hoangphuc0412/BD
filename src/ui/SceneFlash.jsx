import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'

export default function SceneFlash() {
  const epoch = useStore((s) => s.epoch)
  const giftOpened = useStore((s) => s.giftOpened)

  if (!giftOpened) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[45] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={epoch}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, times: [0, 0.16, 1], ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_46%,rgba(255,214,228,0.9),rgba(201,163,106,0.35)_45%,transparent_75%)] mix-blend-screen" />
          <div className="absolute inset-0 loading-veil opacity-70" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
