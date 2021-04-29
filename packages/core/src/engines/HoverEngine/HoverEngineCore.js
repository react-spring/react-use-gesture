import { ConfigResolverMap } from '../../imports'
import { hoverConfigResolver } from '../../config/hoverConfigResolver'
import { CoordinatesEngine } from '../CoordinatesEngine'
import { Pointer } from '../../utils/events'
import { V } from '../../utils/maths'

ConfigResolverMap.set('hover', hoverConfigResolver)

export function HoverEngine(...args) {
  CoordinatesEngine.call(this, ...args, 'hover')
  this.ingKey = 'hovering'
}

HoverEngine.prototype = Object.create(CoordinatesEngine.prototype)

HoverEngine.prototype.pointerEnter = function (event) {
  this.start(event)
  this.state.values = Pointer.values(event)

  this.compute(event)
  this.emit()
}

HoverEngine.prototype.pointerLeave = function (event) {
  if (!this.state._active) return
  this.state._active = false
  const values = Pointer.values(event)
  this.state._movement = V.sub(values, this.state.values)
  this.state.values = values

  this.compute(event)
  this.state.delta = this.state.movement
  this.emit()
}

HoverEngine.prototype.bind = function (bindFunction) {
  bindFunction('pointer', 'enter', this.pointerEnter.bind(this))
  bindFunction('pointer', 'leave', this.pointerLeave.bind(this))
}
