import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'

test.group('Inertia - pages/transaction/show', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should return transaction with categories and referent', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()
    const transaction = await fixtures.createTransaction({
      categoryIds: [categories[0].id, categories[1].id],
      referentId: referents[0].id,
    })

    const response = await client.get(`/transaction/${transaction.id}`).loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('transaction/item')

    const responseProps = response.inertiaProps

    assert.equal(responseProps.transaction.id, transaction.id)
    assert.equal(responseProps.transaction.invoice, transaction.invoice)
    assert.equal(responseProps.transaction.amountExcludingTax, transaction.amountExcludingTax)
    assert.equal(responseProps.transaction.amountAllTax, transaction.amountAllTax)
    assert.equal(responseProps.transaction.type, transaction.type)

    assert.lengthOf(responseProps.transaction.categories, 2)
    assert.equal(responseProps.transaction.referent.name, referents[0].name)

    assert.lengthOf(responseProps.categories, 2)
    assert.lengthOf(responseProps.referents, 3)
  })

  test('Should return to previous route and set error msg for non-existent transaction', async ({
    client,
  }) => {
    const user = await UserFactory.create()

    const response = await client.get('/transaction/99999').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Transaction not found',
    })
  })

  test('Should not allow access to another user transaction', async ({ client }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(otherUser)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const response = await client.get(`/transaction/${transaction.id}`).loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Transaction not found',
    })
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const response = await client.get(`/transaction/${transaction.id}`).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
