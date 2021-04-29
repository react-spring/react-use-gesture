import { registerEngine, MoveEngine } from '@use-gesture/core'
import { Recognizer } from './Recognizer'

registerEngine('move', MoveEngine)

export function MoveGesture(target, handler, config) {
  return new Recognizer(target, { move: handler }, config, 'move')
}
