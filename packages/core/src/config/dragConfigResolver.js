import { V } from '../utils/maths'
import { commonConfigResolver } from './commonConfigResolver'
import { coordinatesConfigResolver } from './coordinatesConfigResolver'
import { SUPPORT } from './support'

export const DEFAULT_DRAG_DELAY = 180
export const DEFAULT_SWIPE_VELOCITY = 0.5
export const DEFAULT_SWIPE_DISTANCE = 50
export const DEFAULT_SWIPE_DURATION = 250

export const dragConfigResolver = {
  ...commonConfigResolver,
  ...coordinatesConfigResolver,
  pointerLock(_v, _k, { pointer: { lock = false, touch = false } = {} }) {
    this.useTouch = SUPPORT.touch && touch
    return SUPPORT.pointerLock && lock
  },
  r3f(value = false) {
    return value
  },
  device() {
    if (this.r3f) return 'pointer'
    if (this.useTouch) return 'touch'
    if (this.pointerLock) return 'mouse'
    if (SUPPORT.pointer) return 'pointer'
    if (SUPPORT.touch) return 'touch'
    return 'mouse'
  },
  preventScroll(value = false) {
    return value && SUPPORT.touch
  },
  pointerCapture(_v, _k, { pointer: { capture = true } = {} }) {
    return !this.pointerLock && this.device === 'pointer' && capture
  },
  threshold(value, _key, { filterTaps = false, axis = undefined }) {
    const threshold = V.toVector(value, filterTaps ? 3 : axis ? 1 : 0)
    this.filterTaps = filterTaps
    return threshold
  },
  swipe({
    velocity = DEFAULT_SWIPE_VELOCITY,
    distance = DEFAULT_SWIPE_DISTANCE,
    duration = DEFAULT_SWIPE_DURATION
  } = {}) {
    return {
      velocity: V.toVector(velocity),
      distance: V.toVector(distance),
      duration
    }
  },
  delay(value = 0) {
    switch (value) {
      case true:
        return DEFAULT_DRAG_DELAY
      case false:
        return 0
      default:
        return value
    }
  }
}
