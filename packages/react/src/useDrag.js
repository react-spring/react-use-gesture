import { registerEngine, DragEngine } from '@use-gesture/core'
import { useRecognizers } from './useRecognizers'

registerEngine('drag', DragEngine)

export function useDrag(handler, config = {}) {
  return useRecognizers({ drag: handler }, config, 'drag')
}
