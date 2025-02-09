import factory from '@adonisjs/lucid/factories'
import Transaction from '#models/transaction'
import { TransactionType } from '#enums/TransactionType'
import { CategoryFactory } from '#database/factories/category_factory'
import { ReferentFactory } from '#database/factories/referent_factory'

export const TransactionFactory = factory
  .define(Transaction, async ({ faker }) => {
    return {
      amountAllTax: faker.number.float({ min: 10, max: 1000, multipleOf: 0.01 }),
      amountExcludingTax: faker.number.float({ min: 10, max: 1000, multipleOf: 0.01 }),
      comment: faker.lorem.sentence(),
      currency: faker.finance.currencyCode(),
      date: faker.date.past(),
      type: faker.helpers.arrayElement(Object.values(TransactionType)),
      invoice: faker.string.alphanumeric(10).toUpperCase(),
    }
  })
  .relation('categories', () => CategoryFactory)
  .relation('referent', () => ReferentFactory)
  .build()
