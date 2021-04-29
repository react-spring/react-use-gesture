import { commonConfigResolver } from './commonConfigResolver'
import { coordinatesConfigResolver } from './coordinatesConfigResolver'

export const moveConfigResolver = {
  ...commonConfigResolver,
  ...coordinatesConfigResolver
}
