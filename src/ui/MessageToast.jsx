import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'

export default function MessageToast() {
  const message = useStore((s) => s.message)
  const hideMessage = useStore((s) => s.hideMessage)

  useEffect(() => {
    if (!message) return
    const t = setTimeout(hideMessage, 7600)
    return () => clearTimeout(t)
  }, [message, hideMessage])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center px-5 sm:bottom-32">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message.at}
            initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: 14, filter: 'blur(6px)', transition: { duration: 0.55 } }}
            className="glass-dark pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl px-6 py-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
          >
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
            <span className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-rose/10 blur-2xl" />
            <button
              onClick={hideMessage}
              aria-label="Đóng lời nhắn"
              className="absolute right-3.5 top-3.5 grid h-6 w-6 place-items-center rounded-full text-pearl/35 transition hover:bg-white/5 hover:text-pearl/80"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M5 5l14 14M19 5 5 19" />
              </svg>
            </button>
            <div className="flex items-start gap-3.5">
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-champagne/25 bg-champagne/[0.06]">
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-rose/80">
                  <path d="M12 21s-7.5-4.7-9.6-9A5.7 5.7 0 0 1 12 6a5.7 5.7 0 0 1 9.6 6c-2.1 4.3-9.6 9-9.6 9Z" />
                </svg>
              </span>
              <div className="pr-5">
                <p className="font-hand text-[1.35rem] leading-snug text-champagne">{message.title}</p>
                <p className="mt-1.5 font-serif text-[0.95rem] leading-relaxed text-pearl/75">{message.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
