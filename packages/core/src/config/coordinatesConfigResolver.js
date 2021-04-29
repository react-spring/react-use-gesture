export const coordinatesConfigResolver = {
  axis(_v, _k, { axis }) {
    this.lockDirection = axis === 'lock'
    if (!this.lockDirection) return axis
  },
  bounds(value = {}) {
    if (typeof value === 'function') {
      return (state) => coordinatesConfigResolver.bounds(value(state))
    }

    if ('current' in value) {
      return () => value.current
    }

    if (typeof HTMLElement === 'function' && value instanceof HTMLElement) {
      return value
    }

    const { left = -Infinity, right = Infinity, top = -Infinity, bottom = Infinity } = value

    return [
      [left, right],
      [top, bottom]
    ]
  }
}
