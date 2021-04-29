import React from 'react'
import { a } from '@react-spring/web'
import { Slider } from './Slider'
import { items } from './items'

import styles from './styles.module.css'

export default function App() {
  return (
    <div className={`flex fill center ${styles.container}`}>
      <div className={styles.main}>
        <Slider items={items} width={700} visible={3}>
          {({ css }, i) => (
            <div className={styles.content}>
              <div className={styles.marker}>{String(i).padStart(2, '0')}</div>
              <a.div className={styles.image} style={{ backgroundImage: css }} />
            </div>
          )}
        </Slider>
      </div>
    </div>
  )
}
