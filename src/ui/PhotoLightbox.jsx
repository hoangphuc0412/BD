import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { content } from '../config/content'

function Arrow({ dir, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Ảnh trước' : 'Ảnh sau'}
      className="glass pointer-events-auto absolute top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-pearl/70 transition hover:border-champagne/50 hover:text-champagne sm:h-11 sm:w-11"
      style={dir === 'prev' ? { left: '-0.25rem' } : { right: '-0.25rem' }}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'prev' ? <path d="M14.5 5 8 12l6.5 7" /> : <path d="M9.5 5 16 12l-6.5 7" />}
      </svg>
    </button>
  )
}

export default function PhotoLightbox() {
  const index = useStore((s) => s.photoIndex)
  const openPhoto = useStore((s) => s.openPhoto)
  const closePhoto = useStore((s) => s.closePhoto)
  const photos = content.memories.photos
  const open = index !== null
  const photo = open ? photos[index] : null

  const step = useCallback(
    (d) => {
      if (index === null) return
      openPhoto((index + d + photos.length) % photos.length)
    },
    [index, openPhoto, photos.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') closePhoto()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closePhoto, step])

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          key="photo-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10 sm:px-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.45 } }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          <div className="absolute inset-0 bg-[#0a0207]/88 backdrop-blur-[14px]" onClick={closePhoto} />

          <button
            onClick={closePhoto}
            aria-label="Đóng ảnh"
            className="absolute right-5 top-5 z-30 grid h-10 w-10 place-items-center rounded-full border border-pearl/20 text-pearl/70 transition hover:border-champagne/60 hover:text-champagne sm:right-8 sm:top-8"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>

          <motion.div
            className="relative z-10 flex w-full max-w-4xl flex-col items-center"
            initial={{ y: 26, scale: 0.98 }}
            animate={{ y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ y: 14, scale: 0.99 }}
          >
            <div className="relative mx-auto w-fit max-w-full">
              <Arrow dir="prev" onClick={() => step(-1)} />
              <Arrow dir="next" onClick={() => step(1)} />

              <div className="relative border border-champagne/25 bg-[#170811]/90 p-2 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)] sm:p-3">
                <div className="pointer-events-none absolute inset-1 border border-champagne/10 sm:inset-1.5" />
                <div className="relative overflow-hidden bg-black/40">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
                      exit={{ opacity: 0, transition: { duration: 0.3 } }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.12}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -60) step(1)
                        else if (info.offset.x > 60) step(-1)
                      }}
                      className="flex cursor-grab items-center justify-center active:cursor-grabbing"
                    >
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        draggable={false}
                        className="max-h-[58vh] w-auto max-w-full select-none object-contain sm:max-h-[66vh]"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 font-sans text-[8px] uppercase tracking-[0.25em] text-pearl/60 backdrop-blur-sm">
                    {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              key={`caption-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } }}
              className="mt-6 max-w-xl px-4 text-center"
            >
              <p className="font-hand text-[1.6rem] leading-tight text-champagne sm:text-[1.9rem]">{photo.caption}</p>
              <p className="mt-2 font-sans text-[8px] uppercase tracking-[0.38em] text-pearl/40 sm:text-[9px]">
                {photo.date}
              </p>
              <p className="mt-3 font-serif text-[0.95rem] italic leading-relaxed text-pearl/60">{photo.note}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
