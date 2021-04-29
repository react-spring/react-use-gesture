import { PinchEngine } from './PinchEngineCore'
import { Touches, distanceAngle } from '../../utils/events'

PinchEngine.prototype.touchStart = function (event) {
  this.ctrl.setEventIds(event)
  const state = this.state
  const ctrlTouchIds = this.ctrl._touchIds

  if (state._active) {
    // check that the touchIds that initiated the gesture are still enabled
    // This is useful for when the page loses track of the pointers (minifying
    // gesture on iPad).
    if (state._touchIds.every((id) => ctrlTouchIds.has(id))) return
    // The gesture is still active, but probably didn't have the opportunity to
    // end properly, so we restart the pinch.
  }

  if (ctrlTouchIds.size < 2) return

  this.start(event)
  state._touchIds = Array.from(ctrlTouchIds).slice(0, 2)

  const payload = Touches.distanceAngle(event, state._touchIds)
  this.pinchStart(event, payload)
}

PinchEngine.prototype.pointerStart = function (event) {
  this.ctrl.setEventIds(event)
  const state = this.state
  const _pointerEvents = state._pointerEvents
  const ctrlPointerIds = this.ctrl._pointerIds

  if (state._active) {
    // see touchStart comment
    if (Array.from(_pointerEvents.keys()).every((id) => ctrlPointerIds.has(id))) return
  }

  if (_pointerEvents.size < 2) {
    _pointerEvents.set(event.pointerId, event)
  }

  if (state._pointerEvents.size < 2) return

  this.start(event)

  const payload = distanceAngle(...Array.from(_pointerEvents.values()))
  this.pinchStart(event, payload)
}

PinchEngine.prototype.pinchStart = function (event, payload) {
  const state = this.state
  state.origin = payload.origin
  state.values = [payload.distance, payload.angle]
  state.initial = state.values

  this.compute(event)
  this.emit()
}

PinchEngine.prototype.touchMove = function (event) {
  if (!this.state._active) return
  const payload = Touches.distanceAngle(event, this.state._touchIds)
  this.pinchMove(event, payload)
}

PinchEngine.prototype.pointerMove = function (event) {
  if (!this.state._active) return
  const _pointerEvents = this.state._pointerEvents
  if (_pointerEvents.has(event.pointerId)) {
    _pointerEvents.set(event.pointerId, event)
  }
  const payload = distanceAngle(...Array.from(_pointerEvents.values()))
  this.pinchMove(event, payload)
}

PinchEngine.prototype.pinchMove = function (event, payload) {
  const state = this.state
  const prev_a = state.values[1]
  const delta_a = payload.angle - prev_a
  let next_turns = state.turns
  if (Math.abs(delta_a) > 270) next_turns += Math.sign(delta_a)

  state.values = [payload.distance, payload.angle - 360 * next_turns]
  state.origin = payload.origin
  state._movement = [state.values[0] / state.initial[0] - 1, state.values[1] - state.initial[1]]

  this.compute(event)
  this.emit()
}

PinchEngine.prototype.touchEnd = function (event) {
  this.ctrl.setEventIds(event)
  if (!this.state._active) return

  if (this.state._touchIds.some((id) => !this.ctrl._touchIds.has(id))) {
    this.state._active = false

    this.compute(event)
    this.emit()
  }
}

PinchEngine.prototype.pointerEnd = function (event) {
  this.state._pointerEvents.delete(event.pointerId)
  this.ctrl.setEventIds(event)
  if (!this.state._active) return

  if (this.state._pointerEvents.size < 2) {
    this.state._active = false
    this.compute(event)
    this.emit()
  }
}
