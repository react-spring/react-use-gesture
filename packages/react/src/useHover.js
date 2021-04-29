import { registerEngine, HoverEngine } from '@use-gesture/core'
import { useRecognizers } from './useRecognizers'

registerEngine('hover', HoverEngine)

export function useMove(handler, config = {}) {
  return useRecognizers({ hover: handler }, config, 'hover')
}
