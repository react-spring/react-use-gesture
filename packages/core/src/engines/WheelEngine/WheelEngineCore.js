import { ConfigResolverMap } from '../../imports'
import { wheelConfigResolver } from '../../config/wheelConfigResolver'
import { CoordinatesEngine } from '../CoordinatesEngine'
import { Wheel } from '../../utils/events'
import { V } from '../../utils/maths'

ConfigResolverMap.set('wheel', wheelConfigResolver)

export function WheelEngine(...args) {
  CoordinatesEngine.call(this, ...args, 'wheel')
  this.ingKey = 'wheeling'
}

WheelEngine.prototype = Object.create(CoordinatesEngine.prototype)

WheelEngine.prototype.wheel = function (event) {
  if (!this.state._active) this.wheelStart(event)
  else this.wheelChange(event)
  this.timeoutStore.add('wheelEnd', this.wheelEnd.bind(this))
}

WheelEngine.prototype.wheelStart = function (event) {
  this.start(event)
  this.wheelChange(event)
}

WheelEngine.prototype.wheelChange = function (event) {
  if (event.cancelable) event.preventDefault()
  const delta = Wheel.values(event)
  V.addTo(this.state._movement, delta)

  this.compute(event)
  this.emit()
}

WheelEngine.prototype.wheelEnd = function () {
  if (!this.state._active) return
  this.state._active = false
  this.compute()
  this.emit()
}

WheelEngine.prototype.bind = function (bindFunction) {
  bindFunction('wheel', '', this.wheel.bind(this))
}
