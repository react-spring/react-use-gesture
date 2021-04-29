import { registerEngine, WheelEngine } from '@use-gesture/core'
import { useRecognizers } from './useRecognizers'

registerEngine('wheel', WheelEngine)

export function useWheel(handler, config = {}) {
  return useRecognizers({ wheel: handler }, config, 'wheel')
}
