import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import Transaction from '#models/transaction'

test.group('Inertia - pages/transaction/destroy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should delete a transaction', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const response = await client
      .delete(`/transaction/${transaction.id}`)
      .loginAs(user)
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')

    const deletedTransaction = await Transaction.find(transaction.id)
    assert.isNull(deletedTransaction)
  })

  test('Should detach categories when deleting transaction', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()
    const transaction = await fixtures.createTransaction({
      categoryIds: [categories[0].id, categories[1].id],
    })

    const transactionWithCategories = await Transaction.query()
      .where('id', transaction.id)
      .preload('categories')
      .firstOrFail()

    assert.lengthOf(transactionWithCategories.categories, 2)

    const response = await client
      .delete(`/transaction/${transaction.id}`)
      .loginAs(user)
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')

    const deletedTransaction = await Transaction.find(transaction.id)
    assert.isNull(deletedTransaction)
  })

  test('Should return to previous route and set error msg for non-existent transaction', async ({
    client,
  }) => {
    const user = await UserFactory.create()

    const response = await client.delete('/transaction/99999').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Transaction not found',
    })
  })

  test('Should not allow deleting another user transaction', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(otherUser)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const response = await client
      .delete(`/transaction/${transaction.id}`)
      .loginAs(user)
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Transaction not found',
    })

    const existingTransaction = await Transaction.find(transaction.id)
    assert.isNotNull(existingTransaction)
  })
})
