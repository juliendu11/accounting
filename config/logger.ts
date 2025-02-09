import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'
import path from 'node:path'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * The loggers object can be used to define multiple loggers.
   * By default, we configure only one logger (named "app").
   */
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: targets()
          .push(targets.pretty({ levelFirst: true, colorize: !app.inProduction }))
          .pushIf(!app.inTest, {
            target: 'pino-roll',
            level: 'debug',
            options: {
              file: app.inTest ? null : path.resolve(import.meta.dirname, '../logs/log'),
              frequency: 'daily',
              mkdir: true,
              dateFormat: 'yyyy-MM-dd',
            },
          })
          .pushIf(!app.inTest, {
            target: 'pino-roll',
            level: 'error',
            options: {
              file: app.inTest ? null : path.resolve(import.meta.dirname, '../logs/error'),
              frequency: 'daily',
              mkdir: true,
              dateFormat: 'yyyy-MM-dd',
            },
          })
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
