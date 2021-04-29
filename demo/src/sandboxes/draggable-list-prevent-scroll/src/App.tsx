import React, { useRef } from 'react'
import { useSprings, animated, config } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import clamp from 'lodash.clamp'
import swap from 'lodash-move'

import styles from './styles.module.css'

const fn = (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0) => (index: number) =>
  active && index === originalIndex
    ? {
        y: curIndex * 100 + y,
        scale: 1.1,
        zIndex: 1,
        shadow: 15,
        immediate: (key: string) => key === 'zIndex',
        config: (key: string) => (key === 'y' ? config.stiff : config.default),
      }
    : {
        y: order.indexOf(index) * 100,
        scale: 1,
        zIndex: 0,
        shadow: 1,
        immediate: false,
      }

function DraggableList({ items }: { items: string[] }) {
  const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order
  const [springs, api] = useSprings(items.length, fn(order.current)) // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const bind = useDrag(
    ({ args: [originalIndex], active, movement: [, y] }) => {
      const curIndex = order.current.indexOf(originalIndex)
      const curRow = clamp(Math.round((curIndex * 100 + y) / 100), 0, items.length - 1)
      const newOrder = swap(order.current, curIndex, curRow)
      api.start(fn(newOrder, active, originalIndex, curIndex, y)) // Feed springs new style data, they'll animate the view without causing a single render
      if (!active) order.current = newOrder
    },
    { preventScroll: true }
  )

  return (
    <div className={styles.content} style={{ height: items.length * 100 }}>
      {springs.map(({ zIndex, shadow, y, scale }, i) => (
        <animated.div
          {...bind(i)}
          key={i}
          style={{
            zIndex,
            boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
            y,
            scale,
          }}
          children={items[i]}
        />
      ))}
    </div>
  )
}

export default function App() {
  return (
    <div className={styles.container}>
      <DraggableList items={'Lorem ipsum dolor sit'.split(' ')} />
      <div style={{ marginTop: 40, padding: 10 }}>
        I'm baby letterpress iPhone skateboard gochujang man bun leggings. Thundercats activated charcoal hella iceland
        cloud bread blue bottle, selfies pop-up live-edge shabby chic raclette food truck. Jean shorts kitsch irony
        mlkshk, vinyl tilde shabby chic vice banh mi bitters keytar. Ethical direct trade vegan, lyft taxidermy YOLO
        adaptogen chillwave whatever. Flexitarian shaman wayfarers affogato, meh fanny pack snackwave squid paleo
        humblebrag. Copper mug shaman crucifix viral la croix tacos. Next level listicle tattooed hot chicken, cronut
        locavore cliche. Mumblecore pug tousled hot chicken 3 wolf moon listicle. Marfa artisan pitchfork, banh mi
        slow-carb godard farm-to-table hammock kombucha intelligentsia viral.
      </div>
    </div>
  )
}
