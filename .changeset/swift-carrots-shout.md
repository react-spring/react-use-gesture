---
'@use-gesture/core': patch
---

## General breaking changes:

- `config.domTarget` is renamed `config.target`
- `config.initial` is renamed `config.from`
- `config.from` accounts for `offset` and not for `movement` as it was the case for `config.initial`
- `config.bounds` accounts for `offset`
- `velocity` is now a Vector with absolute (use `direction` if you need relative velocity)


## Features

### General

### Drag

- keyboard support when target has focus!
- shows warning when `touch-action` is not properly set in development mode
- `bounds` accepts an `HTMLElement` or a React ref
- `config.experimental_preventWindowScrollY` is now `config.preventScroll`

```js
useDrag(handler, {
  pointer: {
    touch: true, // uses touch on mobile
    capture: false, // don't use setPointerCapture (uses window)
    lock: true, // will perform a pointer lock when drag starts, and exit pointer lock when drag ends,
  },
  axis: undefined | 'x' | 'y' | 'lock',
  r3f: true, // will set up the hook to perform the best it can with @react-three/fiber,
  swipe: {
    distance: 50,
    velocity: 0.5,
    duration: 250
  }
})
```

### Pinch

- `distanceBounds` is now `scaleBounds`