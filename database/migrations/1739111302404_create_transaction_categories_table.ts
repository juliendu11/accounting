import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transaction_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('transaction_id').unsigned().notNullable().references('transactions.id')
      table.integer('category_id').unsigned().notNullable().references('categories.id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
