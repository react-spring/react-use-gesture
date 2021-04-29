import { commonConfigResolver } from './commonConfigResolver'
import { coordinatesConfigResolver } from './coordinatesConfigResolver'

export const scrollConfigResolver = {
  ...commonConfigResolver,
  ...coordinatesConfigResolver
}
