import type { StrataApi } from '../shared/types'

declare global {
  interface Window {
    /** API expuesta por el preload (ver src/preload/index.ts). */
    strata: StrataApi
  }
}

export {}
