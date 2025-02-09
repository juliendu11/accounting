import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import timekeeper from 'timekeeper'
import HomeIndexTestsFixtures from '#tests/unit/inertia/page/home/index/home_index_tests_fixtures'

test.group('Inertia - pages/home - selected date range', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return correct transactions for current selected date range', async ({
    assert,
    client,
  }) => {
    timekeeper.freeze('2025-06-24T17:46:34.285Z')

    const user = await UserFactory.merge({ treasury: 1000 }).create()

    const fixtures = new HomeIndexTestsFixtures(user)
    await fixtures.start()
    await fixtures.insertPreviousQuarterTransactions()
    await fixtures.insertCurrentQuarterTransactions()

    const [, , transaction3, , , transaction6] = fixtures.transactions.slice(-6)

    const response = await client
      .get('/')
      .qs({
        'date.from': '2025-06-19T00:00:00.000Z',
        'date.to': '2025-06-24T23:59:59.999Z',
      })
      .loginAs(user)
      .withInertia()

    const responseProps = response.inertiaProps

    response.assertStatus(200)
    response.assertInertiaComponent('home')

    assert.deepEqual(responseProps.availableYears, ['2024', '2025'])
    assert.equal(responseProps.date.from, '2025-06-19T00:00:00.000Z')
    assert.equal(responseProps.date.to, '2025-06-24T23:59:59.999Z')
    assert.lengthOf(responseProps.transactions, 2)

    assert.equal(responseProps.transactions[0].id, transaction3.id)
    assert.equal(responseProps.transactions[1].id, transaction6.id)

    assert.deepEqual(responseProps.treasury, {
      base: 1000,
      excludingTaxes: {
        current: 1070,
        gains: 900,
        losses: 830,
      },
      includingTaxes: {
        current: 1084,
        gains: 1080,
        losses: 996,
      },
    })
    assert.lengthOf(responseProps.categories, 2)
    assert.lengthOf(responseProps.referents, 3)
  })
})
