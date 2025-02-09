import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - stats/widget/overview', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return overview data with monthly breakdown', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.merge({ treasury: 1000 }).create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountExcludingTax: 500,
      amountAllTax: 600,
      date: DateTime.fromISO('2026-01-15'),
    })

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      amountExcludingTax: 200,
      amountAllTax: 240,
      date: DateTime.fromISO('2026-02-10'),
    })

    const response = await client
      .get('/stats/widget/overview?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.property(body, 'categories')
    assert.property(body, 'expensesByMonth')
    assert.property(body, 'recipesByMonth')
    assert.property(body, 'salariesByMonth')
    assert.property(body, 'treasuryByMonth')
    assert.lengthOf(body.categories, 12)
    assert.lengthOf(body.expensesByMonth, 12)
    assert.lengthOf(body.recipesByMonth, 12)
  })

  test('Should return empty arrays when no transactions exist', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const response = await client
      .get('/stats/widget/overview?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.lengthOf(body.categories, 12)
    assert.isTrue(body.expensesByMonth.every((v: number) => v === 0))
    assert.isTrue(body.recipesByMonth.every((v: number) => v === 0))
    assert.isTrue(body.salariesByMonth.every((v: number) => v === 0))
  })

  test('Should not include data from other users', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const otherFixtures = new TransactionTestsFixtures(otherUser)
    await otherFixtures.start()
    await otherFixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountAllTax: 1000,
      date: DateTime.fromISO('2026-01-15'),
    })

    const response = await client
      .get('/stats/widget/overview?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.isTrue(body.recipesByMonth.every((v: number) => v === 0))
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats/widget/overview').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
