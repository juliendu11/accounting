import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - stats/widget/expensesByCategory', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return expenses grouped by category', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      amountExcludingTax: 200,
      amountAllTax: 240,
      categoryIds: [categories[0].id],
      date: DateTime.fromISO('2026-01-10'),
    })

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      amountExcludingTax: 100,
      amountAllTax: 120,
      categoryIds: [categories[1].id],
      date: DateTime.fromISO('2026-02-15'),
    })

    const response = await client
      .get('/stats/widget/expensesByCategory?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.property(body, 'expensesByCategory')
    assert.property(body, 'categories')
    assert.lengthOf(body.categories, 2)
    assert.include(body.categories, categories[0].name)
    assert.include(body.categories, categories[1].name)
  })

  test('Should group expenses without category under Uncategorized', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction(
      {
        type: TransactionType.EXPENSE,
        amountAllTax: 150,
        categoryIds: [],
        date: DateTime.fromISO('2026-01-10'),
      },
      { skipCategories: true }
    )

    const response = await client
      .get('/stats/widget/expensesByCategory?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.include(body.categories, 'Uncategorized')
  })

  test('Should not include recipe transactions', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      categoryIds: [categories[0].id],
      date: DateTime.fromISO('2026-01-10'),
    })

    const response = await client
      .get('/stats/widget/expensesByCategory?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.lengthOf(body.categories, 0)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats/widget/expensesByCategory').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
