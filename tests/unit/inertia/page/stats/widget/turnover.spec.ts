import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - stats/widget/turnover', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return turnover data by month', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountExcludingTax: 1000,
      amountAllTax: 1200,
      date: DateTime.fromISO('2026-02-15'),
    })

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      amountExcludingTax: 400,
      amountAllTax: 480,
      date: DateTime.fromISO('2026-02-20'),
    })

    const response = await client
      .get('/stats/widget/turnover?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.property(body, 'categories')
    assert.property(body, 'turnoverByMonth')
    assert.lengthOf(body.categories, 12)
    assert.lengthOf(body.turnoverByMonth, 12)
    // Only RECIPE transactions count toward turnover
    assert.equal(body.turnoverByMonth[1], 1200)
  })

  test('Should return zero turnover when no recipe transactions', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      date: DateTime.fromISO('2026-01-10'),
    })

    const response = await client
      .get('/stats/widget/turnover?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.isTrue(body.turnoverByMonth.every((v: number) => v === 0))
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats/widget/turnover').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
