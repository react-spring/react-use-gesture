import { registerEngine, PinchEngine } from '@use-gesture/core'
import { useRecognizers } from './useRecognizers'

registerEngine('pinch', PinchEngine)

export function usePinch(handler, config = {}) {
  return useRecognizers({ pinch: handler }, config, 'pinch')
}
