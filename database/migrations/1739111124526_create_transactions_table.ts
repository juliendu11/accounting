import { BaseSchema } from '@adonisjs/lucid/schema'
import { TransactionType } from '#enums/TransactionType'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.string('invoice').notNullable()
      table.timestamp('date').notNullable()
      table.float('amount_excluding_tax').notNullable()
      table.float('amount_all_tax').notNullable()
      table.string('currency').notNullable()
      table.string('comment').nullable()

      table.enu('type', Object.values(TransactionType), {
        useNative: true,
        enumName: 'type',
        existingType: false,
      })

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
