import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - stats/widget/recipesExpensesRatio', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return ratio of recipes and expenses', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountExcludingTax: 1000,
      amountAllTax: 1200,
      date: DateTime.fromISO('2026-01-10'),
    })

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      amountExcludingTax: 400,
      amountAllTax: 480,
      date: DateTime.fromISO('2026-02-05'),
    })

    const response = await client
      .get('/stats/widget/recipesExpensesRatio?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.property(body, 'data')
    assert.property(body, 'categories')
    assert.deepEqual(body.categories, ['Dépenses', 'Recettes'])
    assert.lengthOf(body.data, 2)
    assert.equal(body.data[0], 480)
    assert.equal(body.data[1], 1200)
  })

  test('Should return zero for both when no transactions', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const response = await client
      .get('/stats/widget/recipesExpensesRatio?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.deepEqual(body.data, [0, 0])
    assert.deepEqual(body.categories, ['Dépenses', 'Recettes'])
  })

  test('Should not include salary transactions', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.SALARY,
      amountAllTax: 2000,
      date: DateTime.fromISO('2026-01-31'),
    })

    const response = await client
      .get('/stats/widget/recipesExpensesRatio?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.deepEqual(body.data, [0, 0])
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats/widget/recipesExpensesRatio').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
