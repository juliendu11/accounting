import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'

const SQLITE_PATH = './tmp/db.sqlite3'
const CHUNK_SIZE = 100

// Tables ordered to respect foreign key constraints
const TABLES = [
  'users',
  'categories',
  'referents',
  'transactions',
  'transaction_categories',
  'transaction_documents',
]

export default class ConvertSQLiteToMySQL extends BaseCommand {
  static commandName = 'convert:sqlite-to-mysql'
  static description = 'Migrate data from SQLite (./tmp/db.sqlite3) to MySQL/MariaDB'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    if (!existsSync(SQLITE_PATH)) {
      this.logger.error(`SQLite database not found at ${SQLITE_PATH}`)
      return
    }

    const sqlite = new DatabaseSync(SQLITE_PATH)

    this.logger.info('Starting migration from SQLite to MySQL...')

    await db.rawQuery('SET FOREIGN_KEY_CHECKS = 0')

    try {
      for (const table of TABLES) {
        const rows = sqlite.prepare(`SELECT * FROM \`${table}\``).all() as Record<string, unknown>[]

        if (rows.length === 0) {
          this.logger.info(`  [${table}] no rows, skipping`)
          continue
        }

        await db.rawQuery(`TRUNCATE TABLE \`${table}\``)

        for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
          await db.table(table).multiInsert(rows.slice(i, i + CHUNK_SIZE))
        }

        this.logger.info(`  [${table}] ${rows.length} rows migrated`)
      }

      this.logger.info('Migration completed successfully!')
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`)
      throw error
    } finally {
      await db.rawQuery('SET FOREIGN_KEY_CHECKS = 1')
      sqlite.close()
    }
  }
}