import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import User from '#models/user'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) => ctx.auth?.user,
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.ts',
  },
})

export default inertiaConfig

export type CustomProps = {
  user: User | null
  defaultLocale: string
  flash: {
    notification?: {
      type: 'success' | 'error' | 'info'
      message: string
    }
  }
}

export type PageProps = InferSharedProps<typeof inertiaConfig> & CustomProps

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
