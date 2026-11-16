import { Suspense } from 'react'
import { useStore } from '../lib/store'
import GiftScene from './scenes/GiftScene'
import GardenScene from './scenes/GardenScene'
import LetterScene from './scenes/LetterScene'
import MemoriesScene from './scenes/MemoriesScene'
import CelebrationScene from './scenes/CelebrationScene'

export default function SceneManager() {
  const scene = useStore((s) => s.scene)
  const epoch = useStore((s) => s.epoch)

  return (
    <Suspense fallback={null}>
      <group key={`${scene}-${epoch}`}>
        {scene === 'gift' && <GiftScene />}
        {scene === 'garden' && <GardenScene />}
        {scene === 'letter' && <LetterScene />}
        {scene === 'memories' && <MemoriesScene />}
        {scene === 'celebration' && <CelebrationScene />}
      </group>
    </Suspense>
  )
}
