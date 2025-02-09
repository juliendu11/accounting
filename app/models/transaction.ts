import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'
import type { TransactionTypeType } from '#enums/TransactionType'
import Referent from '#models/referent'
import TransactionDocument from '#models/transaction_document'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare invoice: string

  @column.dateTime()
  declare date: DateTime

  @column()
  declare amountExcludingTax: number

  @column()
  declare amountAllTax: number

  @column()
  declare currency: string

  @column()
  declare comment: string | null

  @column()
  declare type: TransactionTypeType

  @manyToMany(() => Category, {
    pivotTable: 'transaction_categories',
  })
  declare categories: ManyToMany<typeof Category>

  @column()
  declare referentId: number

  @belongsTo(() => Referent)
  declare referent: BelongsTo<typeof Referent>

  @hasMany(() => TransactionDocument)
  declare documents: HasMany<typeof TransactionDocument>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
