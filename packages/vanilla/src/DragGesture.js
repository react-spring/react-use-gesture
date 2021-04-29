import { registerEngine, DragEngine } from '@use-gesture/core'
import { Recognizer } from './Recognizer'

registerEngine('drag', DragEngine)

export function DragGesture(target, handler, config) {
  return new Recognizer(target, { drag: handler }, config, 'drag')
}
