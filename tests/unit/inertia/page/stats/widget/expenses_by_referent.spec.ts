import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import timekeeper from 'timekeeper'

test.group('JSON - stats/widget/expensesByReferent', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return expenses grouped by referent', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { referents } = await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      amountExcludingTax: 300,
      amountAllTax: 360,
      referentId: referents[0].id,
      date: DateTime.fromISO('2026-01-10'),
    })

    await fixtures.createTransaction({
      type: TransactionType.EXPENSE,
      amountExcludingTax: 200,
      amountAllTax: 240,
      referentId: referents[1].id,
      date: DateTime.fromISO('2026-02-15'),
    })

    const response = await client
      .get('/stats/widget/expensesByReferent?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.property(body, 'expensesByReferent')
    assert.property(body, 'referents')
    assert.lengthOf(body.referents, 2)
    assert.include(body.referents, referents[0].name)
    assert.include(body.referents, referents[1].name)
  })

  test('Should group expenses without referent under No referent', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    await fixtures.createTransaction(
      {
        type: TransactionType.EXPENSE,
        amountAllTax: 150,
        referentId: undefined,
        date: DateTime.fromISO('2026-01-10'),
      },
      { skipReferent: true }
    )

    const response = await client
      .get('/stats/widget/expensesByReferent?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.include(body.referents, 'No referent')
  })

  test('Should not include recipe transactions', async ({ assert, client }) => {
    timekeeper.freeze('2026-03-14T12:00:00.000Z')

    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { referents } = await fixtures.start()

    await fixtures.createTransaction({
      type: TransactionType.RECIPE,
      referentId: referents[0].id,
      date: DateTime.fromISO('2026-01-10'),
    })

    const response = await client
      .get('/stats/widget/expensesByReferent?date[year]=2026')
      .loginAs(user)

    response.assertStatus(200)

    const body = response.body()

    assert.lengthOf(body.referents, 0)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/stats/widget/expensesByReferent').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
