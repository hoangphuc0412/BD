import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { content } from '../config/content'

const PAPER_STYLE = {
  background:
    'radial-gradient(120% 90% at 18% 8%, rgba(255,251,242,0.95), transparent 55%), radial-gradient(90% 70% at 92% 96%, rgba(233,214,180,0.5), transparent 60%), linear-gradient(158deg, #f9f1e2 0%, #f3e6cf 48%, #efdfc2 100%)',
}

function useBlocks() {
  return useMemo(() => {
    const l = content.letter
    return [
      { kind: 'greeting', text: l.greeting },
      ...l.paragraphs.map((text, i) => ({ kind: i === 0 ? 'lead' : 'body', text })),
      { kind: 'closing', text: l.closing },
      { kind: 'signature', text: l.signature },
      { kind: 'ps', text: l.ps },
    ]
  }, [])
}

function Paper({ onClose }) {
  const blocks = useBlocks()
  const total = useMemo(() => blocks.reduce((n, b) => n + b.text.length, 0), [blocks])
  const [count, setCount] = useState(0)
  const done = count >= total
  const scrollRef = useRef(null)

  useEffect(() => {
    if (done) return
    const id = setInterval(() => setCount((c) => Math.min(total, c + 2)), 26)
    return () => clearInterval(id)
  }, [done, total])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [count])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  let cursor = 0
  const rendered = blocks.map((b) => {
    const start = cursor
    cursor += b.text.length
    const shown = Math.max(0, Math.min(b.text.length, count - start))
    return {
      ...b,
      visible: b.text.slice(0, shown),
      active: count > start && count < start + b.text.length,
    }
  })
  const lastActive = !done ? rendered.findIndex((r) => r.active) : -1

  return (
    <div className="relative w-full max-w-[570px]">
      <motion.div
        initial={{ opacity: 0, y: 46, rotateX: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.5 } }}
        style={{ ...PAPER_STYLE, transformPerspective: 1200 }}
        className="relative overflow-hidden rounded-[5px] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85),inset_0_0_60px_rgba(150,110,60,0.12)]"
      >
        <span className="pointer-events-none absolute inset-[10px] rounded-[2px] border border-[#b08b52]/25" />
        <span className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply [background-image:repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(80,50,20,0.55)_4px)]" />

        <button
          onClick={onClose}
          aria-label="Đóng lá thư"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-[#6b1735]/20 text-[#6b1735]/60 transition hover:border-[#6b1735]/45 hover:text-[#6b1735]"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="pretty-scroll max-h-[66vh] overflow-y-auto px-7 pb-10 pt-9 sm:max-h-[70vh] sm:px-12 sm:pt-11"
        >
          <div className="flex flex-col items-center">
            <p className="text-[8px] uppercase tracking-[0.42em] text-[#8a5d58]">
              {content.birthday.label} · một lá thư từ {content.sender.name.toLowerCase()}
            </p>
            <span className="mt-3 block h-px w-16 bg-gradient-to-r from-transparent via-[#b08b52] to-transparent" />
          </div>

          {rendered.map((b, i) => {
            const caret = i === lastActive ? 'caret' : ''
            if (b.kind === 'greeting')
              return (
                <p key={i} className={`mt-7 font-hand text-[1.6rem] leading-none text-[#6b1735] ${caret}`}>
                  {b.visible}
                </p>
              )
            if (b.kind === 'lead')
              return (
                <p key={i} className={`mt-6 text-center font-display text-[1.35rem] italic leading-snug text-[#3d0c1f] ${caret}`}>
                  {b.visible}
                </p>
              )
            if (b.kind === 'body')
              return (
                <p key={i} className={`mt-4 font-display text-[1.02rem] leading-[1.85] text-[#4a2330]/90 ${caret}`}>
                  {b.visible}
                </p>
              )
            if (b.kind === 'closing')
              return (
                <div key={i} className="mt-7 flex flex-col items-center text-center">
                  <span className="mb-3 block h-px w-10 bg-gradient-to-r from-transparent via-[#b08b52]/70 to-transparent" />
                  <p className={`font-display text-[1.12rem] italic leading-relaxed text-[#6b1735] ${caret}`}>
                    {b.visible}
                  </p>
                </div>
              )
            if (b.kind === 'signature')
              return (
                <p key={i} className={`mt-5 text-right font-hand text-[1.75rem] leading-none text-[#6b1735] ${caret}`}>
                  {b.visible}
                </p>
              )
            return (
              <p key={i} className={`mt-7 border-t border-[#b08b52]/20 pt-4 font-display text-[0.8rem] italic leading-relaxed text-[#7a5157] ${caret}`}>
                {b.visible}
              </p>
            )
          })}

          <div className="mt-8 flex items-end justify-between">
            <span className="font-display text-[0.62rem] uppercase tracking-[0.35em] text-[#a17c51]">
              forever &amp; a day
            </span>
            <div className="grid h-12 w-12 -rotate-6 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_28%,#a83b58,#6b1735_58%,#3d0c1f)] shadow-[0_8px_20px_-6px_rgba(61,12,31,0.55),inset_0_1px_2px_rgba(255,220,200,0.35)] ring-1 ring-[#e3c297]/35">
              <span className="font-hand text-[0.82rem] text-[#f0d5b4]">
                {content.sender.initial}&amp;{content.her.initial}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.7, duration: 0.8 } }}
        className="mt-4 flex items-center justify-center gap-3"
      >
        {!done ? (
          <>
            <span className="font-display text-[0.68rem] uppercase tracking-[0.32em] text-pearl/35">
              đang viết…
            </span>
            <button onClick={() => setCount(total)} className="btn-ghost !px-5 !py-2 !text-[0.6rem]">
              Hiện tất cả
            </button>
          </>
        ) : (
          <button onClick={onClose} className="btn-ghost !px-6 !py-2.5 !text-[0.62rem]">
            Giữ lá thư này trong tim
          </button>
        )}
      </motion.div>
    </div>
  )
}

export default function LetterModal() {
  const letterOpen = useStore((s) => s.letterOpen)
  const setLetterOpen = useStore((s) => s.setLetterOpen)
  const close = () => setLetterOpen(false)

  return (
    <AnimatePresence>
      {letterOpen && (
        <motion.div
          key="letter-modal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6 } }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
        >
          <motion.div
            className="absolute inset-0 bg-[#0c0309]/75 backdrop-blur-[10px]"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[70vh] w-[70vh] rounded-full bg-wine/20 blur-[120px]" />
          </div>
          <Paper onClose={close} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
