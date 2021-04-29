import { Engine } from '../Engine'
import { ConfigResolverMap } from '../../imports'
import { pinchConfigResolver } from '../../config/pinchConfigResolver'

ConfigResolverMap.set('pinch', pinchConfigResolver)

export function PinchEngine(...args) {
  Engine.call(this, ...args, 'pinch')
  this.ingKey = 'pinching'
}

PinchEngine.prototype = Object.create(Engine.prototype)

PinchEngine.prototype.init = function () {
  this.state.offset = [1, 0]
  this.state.lastOffset = [1, 0]
  this.state._pointerEvents = new Map()
}

// superseeds generic Engine reset call
PinchEngine.prototype.reset = function () {
  Engine.prototype.reset.call(this)
  const state = this.state
  state._touchIds = []
  state.canceled = false
  state.cancel = this.cancel.bind(this)
  state.turns = 0
}

PinchEngine.prototype.computeOffset = function () {
  const { movement, lastOffset } = this.state
  this.state.offset = [(1 + movement[0]) * lastOffset[0], movement[1] + lastOffset[1]]
}

PinchEngine.prototype.computeMovement = function () {
  const { offset, lastOffset } = this.state
  this.state.movement = [offset[0] / lastOffset[0] - 1, offset[1] - lastOffset[1]]
}

PinchEngine.prototype.cancel = function () {
  const state = this.state
  if (state.canceled) return
  setTimeout(() => {
    state.canceled = true
    state._active = false
    // we run compute with no event so that kinematics won't be computed
    this.compute()
    this.emit()
  }, 0)
}

PinchEngine.prototype.bind = function (bindFunction) {
  const device = this.config.device
  if (!!device) {
    bindFunction(device, 'start', this[device + 'Start'].bind(this))
    bindFunction(device, 'change', this[device + 'Move'].bind(this))
    bindFunction(device, 'end', this[device + 'End'].bind(this))
  } else bindFunction('wheel', '', this.wheel.bind(this))
}
