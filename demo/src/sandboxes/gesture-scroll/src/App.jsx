import React, { useState } from 'react'
import { useScroll } from '@use-gesture/react'

export default function App() {
  const [scroll, setScroll] = useState({ direction: 0, delta: 0, movement: 0, offset: 0 })
  const target = React.useRef()
  useScroll(
    ({ direction, delta, movement, offset }) => {
      setScroll({ direction, delta, movement, offset })
    },
    { target, eventOptions: { capture: true } }
  )

  return (
    <div className="center fill">
      <pre style={{ position: 'fixed', padding: 40 }}>{JSON.stringify(scroll, null, '  ')}</pre>
      <div ref={target} style={{ background: 'lightblue', height: '400px', overflow: 'scroll' }}>
        <div style={{ height: '1000px' }} />
      </div>
    </div>
  )
}
