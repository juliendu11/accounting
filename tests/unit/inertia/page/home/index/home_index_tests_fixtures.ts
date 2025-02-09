import { DateTime } from 'luxon'
import { TransactionType } from '#enums/TransactionType'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'

export default class HomeIndexTestsFixtures extends TransactionTestsFixtures {
  private taxPercent = 20

  async insertPreviousQuarterTransactions() {
    if (this.referents.length === 0) {
      throw new Error('Referents not initialized. Call start() first.')
    }
    if (this.categories.length === 0) {
      throw new Error('Categories not initialized. Call start() first.')
    }

    // Charge in previous quarter
    await this.createTransaction({
      referentId: this.referents[1].id,
      date: DateTime.now().minus({ quarter: 1 }),
      amountExcludingTax: 15,
      amountAllTax: 15 + (15 * this.taxPercent) / 100,
      type: TransactionType.EXPENSE,
      categoryIds: [this.categories[1].id],
    })

    // Payment in previous quarter
    await this.createTransaction({
      referentId: this.referents[2].id,
      date: DateTime.now().minus({ quarter: 1 }),
      amountExcludingTax: 300,
      amountAllTax: 300 + (300 * this.taxPercent) / 100,
      type: TransactionType.RECIPE,
      categoryIds: [this.categories[0].id],
    })

    return this.transactions
  }

  async insertCurrentQuarterTransactions() {
    if (this.referents.length === 0) {
      throw new Error('Referents not initialized. Call start() first.')
    }
    if (this.categories.length === 0) {
      throw new Error('Categories not initialized. Call start() first.')
    }

    // Charge in current quarter
    await this.createTransaction({
      referentId: this.referents[0].id,
      date: DateTime.now().minus({ day: 3 }),
      amountExcludingTax: 15,
      amountAllTax: 15 + (15 * this.taxPercent) / 100,
      type: TransactionType.EXPENSE,
      categoryIds: [this.categories[1].id],
    })

    // Payment in current quarter
    await this.createTransaction({
      referentId: this.referents[1].id,
      date: DateTime.now().minus({ day: 10 }),
      amountExcludingTax: 300,
      amountAllTax: 300 + (300 * this.taxPercent) / 100,
      type: TransactionType.RECIPE,
      categoryIds: [this.categories[0].id],
    })

    // Payment in current quarter
    await this.createTransaction({
      referentId: this.referents[2].id,
      date: DateTime.now().minus({ day: 20 }),
      amountExcludingTax: 300,
      amountAllTax: 300 + (300 * this.taxPercent) / 100,
      type: TransactionType.RECIPE,
      categoryIds: [this.categories[0].id],
    })

    // Salary in current quarter
    await this.createTransaction({
      referentId: this.referents[2].id,
      date: DateTime.now().minus({ day: 1 }),
      amountExcludingTax: 800,
      amountAllTax: 800 + (800 * this.taxPercent) / 100,
      type: TransactionType.SALARY,
      categoryIds: [this.categories[0].id],
    })

    return this.transactions
  }
}
