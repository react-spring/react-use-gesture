import { DragEngine } from './DragEngineCore'
import { Pointer } from '../../utils/events'
import { V } from '../../utils/maths'

DragEngine.prototype.pointerDown = function (event) {
  this.ctrl.setEventIds(event)

  const state = this.state
  const config = this.config

  if (state._pointerActive) return

  this.start(event)
  this.setupPointer(event)

  state._pointerId = Pointer.id(event)
  state._pointerActive = true

  state.values = Pointer.values(event)
  state.initial = state.values

  if (config.preventScroll) {
    this.setupScrollPrevention(event)
  } else if (config.delay > 0) {
    this.setupDelayTrigger(event)
  } else {
    this.startPointerDrag(event)
  }
}

DragEngine.prototype.startPointerDrag = function (event) {
  const state = this.state
  state._active = true
  state._preventScroll = true
  state._delayed = false

  this.compute(event)
  this.emit()
}

DragEngine.prototype.pointerMove = function (event) {
  const state = this.state
  const config = this.config

  if (!state._pointerActive) return
  const id = Pointer.id(event)
  if (state._pointerId && id !== state._pointerId) return

  const values = Pointer.values(event)
  let delta

  if (document.pointerLockElement === event.target) {
    delta = [event.movementX, event.movementY]
  } else {
    delta = V.sub(values, state.values)
    state.values = values
  }

  V.addTo(state._movement, delta)
  this.compute(event)

  if (state._delayed) {
    this.timeoutStore.remove('dragDelay')
    this.startPointerDrag(event)
    return
  }

  if (config.preventScroll && !state._preventScroll) {
    if (state.axis) {
      if (state.axis === 'x') {
        this.timeoutStore.remove('startPointerDrag')
        this.startPointerDrag(event)
        return
      } else {
        state._active = false
        this.clean()
        return
      }
    } else {
      return
    }
  }

  this.emit()
}

DragEngine.prototype.pointerUp = function (event) {
  this.ctrl.setEventIds(event)
  const state = this.state
  const config = this.config

  if (!state._pointerActive) return
  const id = Pointer.id(event)
  if (state._pointerId && id !== state._pointerId) return

  this.setActive({ pointer: false })
  this.compute(event)

  const [dx, dy] = state.distance
  state.tap = dx <= 3 && dy <= 3

  if (state.tap && config.filterTaps) {
    state._force = true
  } else {
    const [dirx, diry] = state.direction
    const [vx, vy] = state.velocity
    const [mx, my] = state.movement
    const [svx, svy] = config.swipe.velocity
    const [sx, sy] = config.swipe.distance
    const sdt = config.swipe.duration

    if (state.elapsedTime < sdt) {
      if (Math.abs(vx) > svx && Math.abs(mx) > sx) state.swipe[0] = dirx
      if (Math.abs(vy) > svy && Math.abs(my) > sy) state.swipe[1] = diry
    }
  }

  this.emit()
}

DragEngine.prototype.pointerClick = function (event) {
  if (!this.state.tap) event.stopPropagation()
}

DragEngine.prototype.setupPointer = function (event) {
  const config = this.config
  let device = config.device

  const target = event.target

  if (process.env.NODE_ENV === 'development') {
    try {
      if (device === 'pointer') {
        const currentTarget = config.r3f ? event.sourceEvent.currentTarget : event.currentTarget
        const style = window.getComputedStyle(currentTarget)
        if (style.touchAction === 'auto') {
          // eslint-disable-next-line no-console
          console.warn(
            `[@use-gesture]: The drag target has its \`touch-action\` style property set to \`auto\`. It is recommended to add \`touch-action: 'none'\` so that the drag gesture behaves correctly on touch-enabled devices. For more information read this: https://use-gesture.netlify.app/docs/extras/#touch-action.\n\nThis message will only show in development mode. It won't appear in production. If this is intended, you can ignore it.`,
            currentTarget
          )
        }
      }
    } catch {}
  }

  if (config.pointerLock) {
    event.currentTarget.requestPointerLock()
  }
  if (config.pointerCapture) {
    target.setPointerCapture(event.pointerId)
  }

  if (device === 'touch' || config.pointerCapture) {
    if (!config.r3f) {
      if (process.env.NODE_ENV === 'development') {
        if (event.uv) {
          // eslint-disable-next-line no-console
          console.warn(
            `[@use-gesture]: You're probably using \`use-gesture\` on with \`@react-three/fiber\` without setting the drag config option \`r3f: true\`. The gesture will now probably fail.`
          )
        }
      }
      if (document.pointerLockElement === target) device = 'mouse'
      this.eventStore.add(target, device, 'change', this.pointerMove.bind(this))
      this.eventStore.add(target, device, 'end', this.pointerUp.bind(this))
    }
  } else {
    if (!config.r3f) {
      this.eventStore.add(this.shared.window, device, 'change', this.pointerMove.bind(this))
      this.eventStore.add(this.shared.window, device, 'end', this.pointerUp.bind(this))
    }
  }
}

DragEngine.prototype.pointerClean = function () {
  const state = this.state
  if (!state._pointerActive) return
  const event = state.event
  if (this.config.pointerLock && document.pointerLockElement === state.target) {
    document.exitPointerLock()
  }
  if (this.config.capture && (this.config.r3f || state.target.hasPointerCapture(event.pointerId))) {
    state.target.releasePointerCapture(event.pointerId)
  }
}

DragEngine.prototype.preventScroll = function (event) {
  if (this.state._preventScroll && event.cancelable) {
    event.preventDefault()
  }
}

DragEngine.prototype.setupScrollPrevention = function (event) {
  persistEvent(event)
  // we add window listeners that will prevent the scroll when the user has started dragging
  this.eventStore.add(this.shared.window, 'touch', 'change', this.preventScroll.bind(this), { passive: false })
  this.eventStore.add(this.shared.window, 'touch', 'end', this.clean.bind(this), { passive: false })
  this.eventStore.add(this.shared.window, 'touch', 'cancel', this.clean.bind(this), { passive: false })
  this.timeoutStore.add('startPointerDrag', this.startPointerDrag.bind(this), 250, event)
}

function persistEvent(event) {
  'persist' in event && typeof event.persist === 'function' && event.persist()
}

DragEngine.prototype.setupDelayTrigger = function (event) {
  this.state._delayed = true
  this.timeoutStore.add('dragDelay', this.startPointerDrag.bind(this), this.config.delay, event)
}
