export function call(v, ...args) {
  if (typeof v === 'function') {
    return v(...args)
  } else {
    return v
  }
}

export function noop() {}

export function chain(...fns) {
  if (fns.length === 0) return noop
  if (fns.length === 1) return fns[0]

  return function () {
    let result
    for (const fn of fns) {
      result = fn.apply(this, arguments) || result
    }
    return result
  }
}

export function assignDefault(value, fallback) {
  return Object.assign({}, fallback, value || {})
}
