export function TimeoutStore() {
  this._timeouts = new Map()
}

TimeoutStore.prototype.add = function (key, callback, ms = 140, ...args) {
  this.remove(key)

  this._timeouts.set(key, window.setTimeout(callback, ms, ...args))
}

TimeoutStore.prototype.remove = function (key) {
  const timeout = this._timeouts.get(key)
  if (timeout) window.clearTimeout(timeout)
}

TimeoutStore.prototype.clean = function () {
  this._timeouts.forEach((timeout) => void window.clearTimeout(timeout))
  this._timeouts.clear()
}
