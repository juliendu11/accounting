import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - report/index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should generate and download report for given year', async ({ client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      amountExcludingTax: 500,
      amountAllTax: 600,
      date: DateTime.fromISO('2026-01-10'),
    })

    const response = await client.get('/report?year=2026').loginAs(user)

    response.assertStatus(200)
    response.assertHeader(
      'content-disposition',
      'attachment; filename="report-2026-2026-03-14.xlsx"'
    )
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/report?year=2026').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
