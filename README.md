# React UseGesture


[![npm (tag)](https://img.shields.io/npm/v/react-use-gesture?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/react-use-gesture) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-use-gesture?style=flat&colorA=000000&colorB=000000) ![NPM](https://img.shields.io/npm/l/react-use-gesture?style=flat&colorA=000000&colorB=000000) ![Travis (.org) branch](https://img.shields.io/travis/pmndrs/react-use-gesture/master?style=flat&colorA=000000&colorB=000000) [![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/poimandres)

React UseGesture is a hook that lets you bind richer mouse and touch events to any component or view. With the data you receive, it becomes trivial to set up gestures, and often takes no more than a few lines of code.

You can use it stand-alone, but to make the most of it you should combine it with an animation library like [react-spring](https://github.com/react-spring/react-spring), though you can most certainly use any other.

<p align="middle">
  <a href="https://codesandbox.io/s/draggable-list-fh8r8"><img src="https://i.imgur.com/qLKJod3.gif" width="400"/></a>
  <a href="https://codesandbox.io/s/cards-fduch"><img src="https://i.imgur.com/H6nXQEq.gif" width="400"/></a>
  <a href="https://codesandbox.io/s/action-sheet-zuwji"><img src="https://i.imgur.com/THKPrmR.gif" width="400"/></a>
  <a href="https://codesandbox.io/s/infinite-slideshow-nigoy"><img src="https://i.imgur.com/cuOfqST.gif" width="400"/></a>
  <a href="https://codesandbox.io/s/viewpager-v364z"><img src="https://i.imgur.com/iwZOfT9.gif" width="400"/></a>
  <a href="https://codesandbox.io/s/rkgzi"><img src="https://i.imgur.com/Walt1Ip.gif" width="400"/></a>
</p>

<p align="middle"><i>The demos are real click them!</i></p>

### Installation

```bash
#Yarn
yarn add react-use-gesture

#NPM
npm install react-use-gesture
```

### [Full documentation website](https://use-gesture.netlify.com)

- [Available Hooks](https://use-gesture.netlify.com/docs/hooks)
- [Gesture State](https://use-gesture.netlify.com/docs/state)
- [Gesture Options](https://use-gesture.netlify.com/docs/options)
- [Utilities](https://use-gesture.netlify.com/docs/utilities)
- [FAQ](https://use-gesture.netlify.com/docs/faq)

### Simple example

<p align="middle">
  <a href="https://codesandbox.io/s/react-use-gesture-simple-i5e0j"><img src="https://i.imgur.com/AMzsEi3.gif" width="400"/></a>
</p>

```jsx
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'

function PullRelease() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  // Set the drag hook and define component movement based on gesture data
  const bind = useDrag(({ down, movement: [mx, my] }) => {
    api.start({ x: down ? mx : 0, y: down ? my : 0 })
  })

  // Bind it to a component
  return <animated.div {...bind()} style={{ x, y, touchAction: 'none' }} />
```

The example above makes a `div` draggable so that it follows your mouse on drag, and returns to its initial position on release.

**Make sure you always set [`touchAction`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) on a draggable element to prevent glitches with the browser native scrolling on touch devices**.

### Available hooks

React-use-gesture exports several hooks that can handle different gestures:

| Hook         | Description                                |
| ------------ | ------------------------------------------ |
| `useDrag`    | Handles the drag gesture                   |
| `useMove`    | Handles mouse move events                  |
| `useHover`   | Handles mouse enter and mouse leave events |
| `useScroll`  | Handles scroll events                      |
| `useWheel`   | Handles wheel events                       |
| `usePinch`   | Handles the pinch gesture                  |
| `useGesture` | Handles multiple gestures in one hook      |

#### [More on the full documentation website...](https://use-gesture.netlify.com)
