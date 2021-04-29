import { registerEngine, ScrollEngine } from '@use-gesture/core'
import { Recognizer } from './Recognizer'

registerEngine('scroll', ScrollEngine)

export function ScrollGesture(target, handler, config) {
  return new Recognizer(target, { scroll: handler }, config, 'scroll')
}
