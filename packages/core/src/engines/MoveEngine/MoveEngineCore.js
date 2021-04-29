import { ConfigResolverMap } from '../../imports'
import { moveConfigResolver } from '../../config/moveConfigResolver'
import { CoordinatesEngine } from '../CoordinatesEngine'
import { Pointer } from '../../utils/events'
import { V } from '../../utils/maths'

ConfigResolverMap.set('move', moveConfigResolver)

export function MoveEngine(...args) {
  CoordinatesEngine.call(this, ...args, 'move')
  this.ingKey = 'moving'
}

MoveEngine.prototype = Object.create(CoordinatesEngine.prototype)

MoveEngine.prototype.move = function (event) {
  if (!this.state._active) this.moveStart(event)
  else this.moveChange(event)
  this.timeoutStore.add('moveEnd', this.moveEnd.bind(this))
}

MoveEngine.prototype.moveStart = function (event) {
  this.start(event)
  this.state.values = Pointer.values(event)
  this.moveChange(event)
}

MoveEngine.prototype.moveChange = function (event) {
  if (event.cancelable) event.preventDefault()
  const values = Pointer.values(event)
  const delta = V.sub(values, this.state.values)
  V.addTo(this.state._movement, delta)
  this.state.values = values

  this.compute(event)
  this.emit()
}

MoveEngine.prototype.moveEnd = function (event) {
  if (!this.state._active) return
  this.state._active = false
  this.compute(event)
  this.emit()
}

MoveEngine.prototype.bind = function (bindFunction) {
  bindFunction('pointer', 'change', this.move.bind(this))
  bindFunction('pointer', 'leave', this.moveEnd.bind(this))
}
