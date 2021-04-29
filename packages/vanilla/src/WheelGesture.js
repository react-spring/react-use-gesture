import { registerEngine, WheelEngine } from '@use-gesture/core'
import { Recognizer } from './Recognizer'

registerEngine('wheel', WheelEngine)

export function WheelGesture(target, handler, config) {
  return new Recognizer(target, { wheel: handler }, config, 'wheel')
}
