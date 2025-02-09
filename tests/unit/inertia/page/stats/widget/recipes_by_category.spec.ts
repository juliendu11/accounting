import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - stats/widget/recipesByCategory', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return recipes grouped by category', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountExcludingTax: 500,
      amountAllTax: 600,
      categoryIds: [categories[0].id],
      date: DateTime.fromISO('2026-01-10'),
    })

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountExcludingTax: 300,
      amountAllTax: 360,
      categoryIds: [categories[1].id],
      date: DateTime.fromISO('2026-02-15'),
    })

    const response = await client
      .get('/stats/widget/recipesByCategory?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.property(body, 'expensesByCategory')
    assert.property(body, 'categories')
    assert.lengthOf(body.categories, 2)
    assert.include(body.categories, categories[0].name)
    assert.include(body.categories, categories[1].name)
  })

  test('Should group recipes without category under Uncategorized', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction(
      {
        type: TransactionType.RECIPE,
        amountAllTax: 400,
        categoryIds: [],
        date: DateTime.fromISO('2026-01-10'),
      },
      { skipCategories: true }
    )

    const response = await client
      .get('/stats/widget/recipesByCategory?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.include(body.categories, 'Uncategorized')
  })

  test('Should not include expense transactions', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      categoryIds: [categories[0].id],
      date: DateTime.fromISO('2026-01-10'),
    })

    const response = await client
      .get('/stats/widget/recipesByCategory?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.lengthOf(body.categories, 0)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats/widget/recipesByCategory').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
