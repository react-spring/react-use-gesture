import { Controller } from '@use-gesture/core'

export function Recognizer(target, handlers, config, gestureKey) {
  this._gestureKey = gestureKey
  this._ctrl = new Controller(handlers)
  this._ctrl.applyHandlers(handlers)
  this._ctrl.applyConfig({ ...config, target }, this._gestureKey)

  this._ctrl.effect()
}

Recognizer.prototype.destroy = function () {
  this._ctrl.clean()
}
