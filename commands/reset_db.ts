import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import env from '#start/env'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'

export default class ResetDB extends BaseCommand {
  static commandName = 'db:reset'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const currentLogger = logger.child({
      name: `ResetSeed`,
    })

    const databaseName = env.get('DB_DATABASE')

    await db.rawQuery(`DROP DATABASE IF EXISTS ${databaseName};`)
    await db.rawQuery(`CREATE DATABASE ${databaseName};`)

    currentLogger.info('Database reset complete!')
  }
}
