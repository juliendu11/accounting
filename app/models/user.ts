import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Transaction from '#models/transaction'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Referent from '#models/referent'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @hasMany(() => Referent)
  declare referent: HasMany<typeof Referent>

  @column.dateTime()
  declare confirmTokenSentAt: DateTime

  @column.dateTime()
  declare confirmedAt: DateTime | null

  @column()
  declare confirmToken: string

  @column()
  declare locale: string

  @column()
  declare theme: string

  @column()
  declare treasury: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
