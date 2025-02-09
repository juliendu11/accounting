import { TransactionFactory } from '#database/factories/transaction_factory'
import { CategoryFactory } from '#database/factories/category_factory'
import { ReferentFactory } from '#database/factories/referent_factory'
import User from '#models/user'
import Category from '#models/category'
import Referent from '#models/referent'
import Transaction from '#models/transaction'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'

export default class TransactionTestsFixtures {
  categories: Category[] = []
  referents: Referent[] = []
  transactions: Transaction[] = []

  constructor(protected readonly user: User) {}

  async start() {
    const uniqueId = string.random(8)

    this.categories = await CategoryFactory.merge([
      { name: `Services-${uniqueId}`, userId: this.user.id },
      { name: `Products-${uniqueId}`, userId: this.user.id },
    ]).createMany(2)

    this.referents = await ReferentFactory.merge([
      { name: `Client A-${uniqueId}`, userId: this.user.id },
      { name: `Client B-${uniqueId}`, userId: this.user.id },
      { name: `Client C-${uniqueId}`, userId: this.user.id },
    ]).createMany(3)

    return {
      categories: this.categories,
      referents: this.referents,
    }
  }

  async createTransaction(
    overrides: Partial<{
      type: (typeof TransactionType)[keyof typeof TransactionType]
      amountExcludingTax: number
      amountAllTax: number
      date: DateTime
      referentId: number
      categoryIds: number[]
    }> = {},
    opts?: { skipCategories?: boolean; skipReferent?: boolean }
  ) {
    const payload: any = {
      userId: this.user.id,
      type: overrides.type ?? TransactionType.RECIPE,
      amountExcludingTax: overrides.amountExcludingTax ?? 100,
      amountAllTax: overrides.amountAllTax ?? 120,
      date: overrides.date ?? DateTime.now(),
      referentId: overrides.referentId ?? this.referents[0]?.id,
    }

    if (opts && opts.skipReferent) {
      payload.referentId = null
    }

    const transaction = await TransactionFactory.merge(payload).create()

    if (!opts || !opts.skipCategories) {
      if (overrides.categoryIds && overrides.categoryIds.length > 0) {
        await transaction.related('categories').attach(overrides.categoryIds)
      } else if (this.categories.length > 0) {
        await transaction.related('categories').attach([this.categories[0].id])
      }
    }

    this.transactions.push(transaction)
    return transaction
  }
}
