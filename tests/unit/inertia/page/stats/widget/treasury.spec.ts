import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - stats/widget/treasury', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return treasury data by month', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.merge({ treasury: 500 }).create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountExcludingTax: 300,
      amountAllTax: 360,
      date: DateTime.fromISO('2026-01-20'),
    })

    const response = await client
      .get('/stats/widget/treasury?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.property(body, 'categories')
    assert.property(body, 'treasuryByMonth')
    assert.lengthOf(body.categories, 12)
    assert.lengthOf(body.treasuryByMonth, 12)
  })

  test('Should return empty treasury when no transactions exist', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const response = await client
      .get('/stats/widget/treasury?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.lengthOf(body.categories, 12)
    assert.isTrue(body.treasuryByMonth.every((v: number) => v === 0))
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats/widget/treasury').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
