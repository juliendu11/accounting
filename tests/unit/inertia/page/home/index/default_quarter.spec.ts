import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import timekeeper from 'timekeeper'
import HomeIndexTestsFixtures from '#tests/unit/inertia/page/home/index/home_index_tests_fixtures'

test.group('Inertia - pages/home - default quater', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    timekeeper.reset()
  })

  test('Should return correct transactions for current quarter by default', async ({
    assert,
    client,
  }) => {
    timekeeper.freeze('2025-06-24T17:46:34.285Z')

    const user = await UserFactory.merge({ treasury: 1000 }).create()

    const fixtures = new HomeIndexTestsFixtures(user)
    await fixtures.start()
    await fixtures.insertPreviousQuarterTransactions()
    await fixtures.insertCurrentQuarterTransactions()

    const [transaction3, transaction4, transaction5, transaction6] = fixtures.transactions.slice(-4)

    const response = await client.get('/').loginAs(user).withInertia()

    const responseProps = response.inertiaProps

    response.assertStatus(200)
    response.assertInertiaComponent('home')

    assert.deepEqual(responseProps.availableYears, ['2024', '2025'])
    assert.equal(responseProps.date.from, '2025-04-01T00:00:00.000+00:00')
    assert.equal(responseProps.date.to, '2025-06-30T23:59:59.999+00:00')
    assert.lengthOf(responseProps.transactions, 4)

    assert.equal(responseProps.transactions[0].id, transaction3.id)
    assert.equal(responseProps.transactions[1].id, transaction4.id)
    assert.equal(responseProps.transactions[2].id, transaction5.id)
    assert.equal(responseProps.transactions[3].id, transaction6.id)

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

  test('Should return transactions with categories and referents loaded', async ({
    assert,
    client,
  }) => {
    timekeeper.freeze('2025-06-24T17:46:34.285Z')

    const user = await UserFactory.merge({ treasury: 1000 }).create()

    const fixtures = new HomeIndexTestsFixtures(user)
    await fixtures.start()
    await fixtures.insertPreviousQuarterTransactions()
    await fixtures.insertCurrentQuarterTransactions()

    const response = await client.get('/').loginAs(user).withInertia()

    const responseProps = response.inertiaProps

    response.assertStatus(200)
    response.assertInertiaComponent('home')

    assert.deepEqual(responseProps.transactions[0].categories[0].name, fixtures.categories[1].name)
    assert.deepEqual(responseProps.transactions[1].categories[0].name, fixtures.categories[0].name)
    assert.deepEqual(responseProps.transactions[2].categories[0].name, fixtures.categories[0].name)
    assert.deepEqual(responseProps.transactions[3].categories[0].name, fixtures.categories[0].name)

    assert.deepEqual(responseProps.transactions[0].referent.name, fixtures.referents[0].name)
    assert.deepEqual(responseProps.transactions[1].referent.name, fixtures.referents[1].name)
    assert.deepEqual(responseProps.transactions[2].referent.name, fixtures.referents[2].name)
    assert.deepEqual(responseProps.transactions[3].referent.name, fixtures.referents[2].name)
  })
})
