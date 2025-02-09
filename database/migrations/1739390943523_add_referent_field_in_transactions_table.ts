import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('referent_id').unsigned().nullable().references('referents.id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('referent_id')
    })
  }
}
