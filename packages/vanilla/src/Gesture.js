import {
  registerEngine,
  DragEngine,
  PinchEngine,
  ScrollEngine,
  WheelEngine,
  MoveEngine,
  HoverEngine,
  parseMergedHandlers
} from '@use-gesture/core'
import { Recognizer } from './Recognizer'

registerEngine('drag', DragEngine)
registerEngine('pinch', PinchEngine)
registerEngine('scroll', ScrollEngine)
registerEngine('wheel', WheelEngine)
registerEngine('move', MoveEngine)
registerEngine('hover', HoverEngine)

export function Gesture(target, _handlers, _config = {}) {
  const { handlers, nativeHandlers, config } = parseMergedHandlers(_handlers, _config)
  return new Recognizer(target, handlers, config, undefined, nativeHandlers)
}
