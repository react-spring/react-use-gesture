import { registerEngine, ScrollEngine } from '@use-gesture/core'
import { useRecognizers } from './useRecognizers'

registerEngine('scroll', ScrollEngine)

export function useScroll(handler, config = {}) {
  return useRecognizers({ scroll: handler }, config, 'scroll')
}
