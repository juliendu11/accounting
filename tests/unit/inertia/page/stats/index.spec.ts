import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('Inertia - pages/stats/index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return stats page with available years', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({ date: DateTime.fromISO('2024-06-15') })
    await fixtures.createTransaction({ date: DateTime.fromISO('2025-03-10') })
    await fixtures.createTransaction({ date: DateTime.fromISO('2026-01-20') })

    const response = await client.get('/stats').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('stats/index')

    const responseProps = response.inertiaProps

    assert.include(responseProps.availableYears, 2026)
    assert.include(responseProps.availableYears, 2025)
    assert.include(responseProps.availableYears, 2024)
  })

  test('Should return stats page with empty available years when no transactions', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create()

    const response = await client.get('/stats').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('stats/index')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.availableYears, 0)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
