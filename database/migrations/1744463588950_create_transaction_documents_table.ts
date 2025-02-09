import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transaction_documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('transaction_id')
        .unsigned()
        .notNullable()
        .references('transactions.id')
        .onDelete('CASCADE')

      table.string('name').notNullable()
      table.string('type').notNullable()
      table.string('path').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
