import { create } from 'zustand'
import { detectQuality } from './quality'

const QUALITY = detectQuality()

export const useStore = create((set, get) => ({
  quality: QUALITY,
  loaded: false,
  scene: 'gift',
  epoch: 0,
  visited: { gift: true },
  giftOpened: false,
  letterOpened: false,
  wishMade: false,
  started: false,
  musicOn: false,
  message: null,
  letterOpen: false,
  photoIndex: null,
  hintSeen: false,

  setQuality: (quality) => set({ quality }),
  finishLoading: () => set({ loaded: true }),

  setScene: (id) => {
    const s = get()
    if (!s.giftOpened && id !== 'gift') return
    if (id === s.scene) {
      set({ epoch: s.epoch + 1, letterOpen: false, photoIndex: null, message: null })
      return
    }
    set({
      scene: id,
      epoch: s.epoch + 1,
      visited: { ...s.visited, [id]: true },
      letterOpen: false,
      photoIndex: null,
      message: null,
    })
  },

  nextScene: () => {
    const order = ['gift', 'garden', 'letter', 'memories', 'celebration']
    const cur = order.indexOf(get().scene)
    const next = order[Math.min(order.length - 1, cur + 1)]
    get().setScene(next)
  },

  openGift: () => set((s) => ({ giftOpened: true, started: true, visited: { ...s.visited, gift: true } })),
  setLetterOpen: (v) => set({ letterOpen: v, letterOpened: true }),
  openPhoto: (i) => set({ photoIndex: i }),
  closePhoto: () => set({ photoIndex: null }),
  makeWish: () => set({ wishMade: true }),

  showMessage: (message) => set({ message: { ...message, at: Date.now() } }),
  hideMessage: () => set({ message: null }),

  setMusic: (on) => set({ musicOn: on }),
  markHintSeen: () => set({ hintSeen: true }),

  restart: () =>
    set((s) => ({
      scene: 'gift',
      epoch: s.epoch + 1,
      visited: { gift: true },
      giftOpened: false,
      letterOpened: false,
      letterOpen: false,
      wishMade: false,
      photoIndex: null,
      message: null,
    })),
}))

if (import.meta.env.DEV) window.__loveStore = useStore
