import { V } from '../utils/maths'

export const DEFAULT_RUBBERBAND = 0.15

export const commonConfigResolver = {
  enabled(value = true) {
    return value
  },
  triggerAllEvents(value = false) {
    return value
  },
  threshold(value = 0) {
    return V.toVector(value)
  },
  rubberband(value = 0) {
    switch (value) {
      case true:
        return [DEFAULT_RUBBERBAND, DEFAULT_RUBBERBAND]
      case false:
        return [0, 0]
      default:
        return V.toVector(value)
    }
  },
  from(value) {
    if (typeof value === 'function') return value
    // eslint-disable-next-line eqeqeq
    if (value != null) return V.toVector(value)
  }
}
