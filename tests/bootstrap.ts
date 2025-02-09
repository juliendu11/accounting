import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { apiClient, ApiResponse } from '@japa/api-client'
import { inertiaApiClient } from '@adonisjs/inertia/plugins/api_client'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import UIReporter from '@juliendu11/japa-ui-reporter'
import * as reporterRunners from '@japa/runner/reporters'
/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  sessionApiClient(app),
  apiClient(),
  inertiaApiClient(app),
  authApiClient(app),
]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    async () => {
      await testUtils.db().migrate()
      await testUtils.db().truncate()
    },
  ],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e', 'unit'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}

export const reporters: Config['reporters'] = {
  activated: ['spec'],
  // @ts-ignore
  list: [UIReporter.ui(), reporterRunners.spec()],
}

/**
 * Extend ApiResponse to add custom assertions or getters
 */
ApiResponse.macro('assertNotificationContains', function (this: any, data: any) {
  const props = this.inertiaProps
  const notification = props?.notification || {}

  this.assert!.containsSubset(notification, data)
})
declare module '@japa/api-client' {
  interface ApiResponse {
    assertNotificationContains(data: any): void
  }
}
