import { PinchEngine } from './PinchEngineCore'
import { Wheel } from '../../utils/events'
import { V } from '../../utils/maths'

const PINCH_WHEEL_RATIO = 60

PinchEngine.prototype.wheel = function (event) {
  if (!event.ctrlKey) return
  if (!this.state._active) this.wheelStart(event)
  else this.wheelChange(event)
  this.timeoutStore.add('wheelEnd', this.wheelEnd.bind(this))
}

PinchEngine.prototype.wheelStart = function (event) {
  if (event.cancelable) event.preventDefault()
  else if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      `[@use-gesture]: To properly support zoom on trackpads, try using the \`target\` option and \`config.eventOptions.passive\` set to \`false\`. This message will only appear in development mode.`,
      event.currentTarget
    )
  }
  this.start(event)
  this.wheelChange(event)
}

PinchEngine.prototype.wheelChange = function (event) {
  if (event.cancelable) event.preventDefault()
  const deltaY = Wheel.values(event)[1]
  V.addTo(this.state._movement, [-deltaY / PINCH_WHEEL_RATIO, 0])

  this.state.origin = [event.clientX, event.clientY]

  this.compute(event)
  this.emit()
}

PinchEngine.prototype.wheelEnd = function () {
  if (!this.state._active) return
  this.state._active = false
  this.compute()
  this.emit()
}
