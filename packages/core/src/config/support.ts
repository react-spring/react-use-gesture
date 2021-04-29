const isBrowser = typeof window !== 'undefined' && window.document && window.document.createElement

function supportsTouchEvents(): boolean {
  return isBrowser && 'ontouchstart' in window
}

function supportsPointerEvents(): boolean {
  return isBrowser && 'onpointerdown' in window
}

function supportsPointerLock(): boolean {
  return isBrowser && 'exitPointerLock' in window.document
}

function supportsGestureEvents(): boolean {
  try {
    // TODO [TS] possibly find GestureEvent definitions?
    // @ts-ignore: no type definitions for webkit GestureEvents
    return 'constructor' in GestureEvent
  } catch (e) {
    return false
  }
}

export const SUPPORT = {
  isBrowser,
  gesture: supportsGestureEvents(),
  touch: supportsTouchEvents(),
  pointer: supportsPointerEvents(),
  pointerLock: supportsPointerLock()
}
