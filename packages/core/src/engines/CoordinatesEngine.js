import { Engine } from './Engine'
import { V } from '../utils/maths'

export function CoordinatesEngine(...args) {
  Engine.call(this, ...args)
}

CoordinatesEngine.prototype = Object.create(Engine.prototype)

CoordinatesEngine.prototype.reset = function () {
  Engine.prototype.reset.call(this)
  this.state.axis = undefined
}

CoordinatesEngine.prototype.init = function () {
  this.state.offset = [0, 0]
  this.state.lastOffset = [0, 0]
}

CoordinatesEngine.prototype.computeOffset = function () {
  const state = this.state
  state.offset = V.add(state.lastOffset, state.movement)
}

CoordinatesEngine.prototype.computeMovement = function () {
  const { offset, lastOffset } = this.state
  this.state.movement = V.sub(offset, lastOffset)
}

CoordinatesEngine.prototype.intent = function (v) {
  const state = this.state

  if (!state.axis) {
    const axisMovementDifference = Math.abs(v[0]) - Math.abs(v[1])
    if (axisMovementDifference < 0) state.axis = 'y'
    else if (axisMovementDifference > 0) state.axis = 'x'
  }

  if (this.config.lockDirection) {
    if (state.axis === 'x') v[1] = 0
    else if (state.axis === 'y') v[0] = 0
  } else if (state.axis && this.config.axis) {
    if (state.axis !== this.config.axis) {
      state._active = false
      state._blocked = true
    } else if (state.axis === 'x') v[1] = 0
    else if (state.axis === 'y') v[0] = 0
  }
}
