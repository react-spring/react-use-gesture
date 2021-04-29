const EVENT_TYPE_MAP = {
  pointer: { start: 'down', change: 'move', end: 'up' },
  mouse: { start: 'down', change: 'move', end: 'up' },
  touch: { start: 'start', change: 'move', end: 'end' },
  gesture: { start: 'start', change: 'change', end: 'end' }
}

function capitalize(string) {
  if (!string) return ''
  return string[0].toUpperCase() + string.slice(1)
}

export function toReactHandlerProp(device, action = '', capture) {
  const deviceKey = EVENT_TYPE_MAP[device]
  const actionKey = deviceKey ? deviceKey[action] : action
  return 'on' + capitalize(device) + capitalize(actionKey) + (capture ? 'Capture' : '')
}

export function toDomEventType(device, action = '') {
  const deviceKey = EVENT_TYPE_MAP[device]
  const actionKey = deviceKey ? deviceKey[action] || action : action
  return device + actionKey
}

export function isTouch(event) {
  return event.touches
}

function getTouchesList(event, useAllTouches = false) {
  if (useAllTouches) {
    return Array.from(event.touches).filter((e) => event.currentTarget.contains(e.target))
  }

  return event.type === 'touchend' ? event.changedTouches : event.targetTouches
}

function getValueEvent(event) {
  return isTouch(event) ? getTouchesList(event)[0] : event
}

export function distanceAngle(P1, P2) {
  const dx = P2.clientX - P1.clientX
  const dy = P2.clientY - P1.clientY
  const cx = (P2.clientX + P1.clientX) / 2
  const cy = (P2.clientY + P1.clientY) / 2

  const distance = Math.hypot(dx, dy)
  const angle = -(Math.atan2(dx, dy) * 180) / Math.PI
  const origin = [cx, cy]
  return { angle, distance, origin }
}

export const Touches = {
  ids(event) {
    return getTouchesList(event, true).map((touch) => touch.identifier)
  },
  distanceAngle(event, ids) {
    const [P1, P2] = Array.from(event.touches).filter((touch) => ids.includes(touch.identifier))
    return distanceAngle(P1, P2)
  }
}

export const Pointer = {
  id(event) {
    const valueEvent = getValueEvent(event)
    return isTouch(event) ? valueEvent.identifier : valueEvent.pointerId
  },
  values(event) {
    const valueEvent = getValueEvent(event)
    // if (valueEvent.uv) return [valueEvent.uv.x, valueEvent.uv.y]
    return [valueEvent.clientX, valueEvent.clientY]
  }
}

// wheel delta defaults from https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
const LINE_HEIGHT = 40
const PAGE_HEIGHT = 800

export const Wheel = {
  values(event) {
    let { deltaX, deltaY, deltaMode } = event
    // normalize wheel values, especially for Firefox
    if (deltaMode === 1) {
      deltaX *= LINE_HEIGHT
      deltaY *= LINE_HEIGHT
    } else if (deltaMode === 2) {
      deltaX *= PAGE_HEIGHT
      deltaY *= PAGE_HEIGHT
    }
    return [deltaX, deltaY]
  }
}

export const Scroll = {
  values(event) {
    // If the currentTarget is the window then we return the scrollX/Y position.
    // If not (ie the currentTarget is a DOM element), then we return scrollLeft/Top
    const { scrollX, scrollY, scrollLeft, scrollTop } = event.currentTarget
    return [scrollX ?? scrollLeft ?? 0, scrollY ?? scrollTop ?? 0]
  }
}

export function getEventDetails(event) {
  const buttons = 'buttons' in event ? event.buttons : 0
  const { shiftKey, altKey, metaKey, ctrlKey } = event
  return { buttons, shiftKey, altKey, metaKey, ctrlKey }
}
