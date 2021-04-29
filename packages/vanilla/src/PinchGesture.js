import { registerEngine, PinchEngine } from '@use-gesture/core'
import { Recognizer } from './Recognizer'

registerEngine('pinch', PinchEngine)

export function PinchGesture(target, handler, config) {
  return new Recognizer(target, { pinch: handler }, config, 'pinch')
}
