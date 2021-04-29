import { registerEngine, MoveEngine } from '@use-gesture/core'
import { useRecognizers } from './useRecognizers'

registerEngine('move', MoveEngine)

export function useMove(handler, config = {}) {
  return useRecognizers({ move: handler }, config, 'move')
}
