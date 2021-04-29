import { commonConfigResolver } from './commonConfigResolver'
import { coordinatesConfigResolver } from './coordinatesConfigResolver'

export const wheelConfigResolver = {
  ...commonConfigResolver,
  ...coordinatesConfigResolver
}
