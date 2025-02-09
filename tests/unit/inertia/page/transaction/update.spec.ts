import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import Transaction from '#models/transaction'
import { TransactionType } from '#enums/TransactionType'
import Referent from '#models/referent'

test.group('Inertia - pages/transaction/update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should update a transaction', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()
    const transaction = await fixtures.createTransaction({
      categoryIds: [categories[0].id],
      referentId: referents[0].id,
    })

    const response = await client
      .put(`/transaction/${transaction.id}`)
      .loginAs(user)
      .json({
        invoice: 'INV-UPDATED',
        date: '2025-02-20',
        referent: referents[1].name,
        categories: [categories[1].id],
        amountExcludingTax: 500,
        amountAllTax: 600,
        currency: 'USD',
        comment: 'Updated comment',
        type: TransactionType.EXPENSE,
      })
      .withInertia()

    response.assertStatus(200)
    response.assertRedirectsTo('/')

    const updatedTransaction = await Transaction.query()
      .where('id', transaction.id)
      .preload('categories')
      .preload('referent')
      .firstOrFail()

    assert.equal(updatedTransaction.invoice, 'INV-UPDATED')
    assert.equal(updatedTransaction.amountExcludingTax, 500)
    assert.equal(updatedTransaction.amountAllTax, 600)
    assert.equal(updatedTransaction.currency, 'USD')
    assert.equal(updatedTransaction.comment, 'Updated comment')
    assert.equal(updatedTransaction.type, TransactionType.EXPENSE)
    assert.lengthOf(updatedTransaction.categories, 1)
    assert.equal(updatedTransaction.categories[0].id, categories[1].id)
    assert.equal(updatedTransaction.referent.name, referents[1].name)
  })

  test('Should create new referent when updating with new referent name', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()
    const transaction = await fixtures.createTransaction({
      categoryIds: [categories[0].id],
      referentId: referents[0].id,
    })

    const response = await client
      .put(`/transaction/${transaction.id}`)
      .loginAs(user)
      .json({
        invoice: transaction.invoice,
        date: '2025-01-15',
        referent: 'Brand New Client',
        categories: [categories[0].id],
        amountExcludingTax: transaction.amountExcludingTax,
        amountAllTax: transaction.amountAllTax,
        currency: 'EUR',
        type: transaction.type,
      })
      .withInertia()

    response.assertStatus(200)

    const newReferent = await Referent.query()
      .where('userId', user.id)
      .where('name', 'Brand New Client')
      .firstOrFail()

    assert.equal(newReferent.name, 'Brand New Client')

    const updatedTransaction = await Transaction.query().where('id', transaction.id).firstOrFail()

    assert.equal(updatedTransaction.referentId, newReferent.id)
  })

  test('Should update categories - add new and remove old', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()
    const transaction = await fixtures.createTransaction({
      categoryIds: [categories[0].id],
      referentId: referents[0].id,
    })

    const response = await client
      .put(`/transaction/${transaction.id}`)
      .loginAs(user)
      .json({
        invoice: transaction.invoice,
        date: '2025-01-15',
        referent: referents[0].name,
        categories: [categories[1].id],
        amountExcludingTax: transaction.amountExcludingTax,
        amountAllTax: transaction.amountAllTax,
        currency: 'EUR',
        type: transaction.type,
      })
      .withInertia()

    response.assertStatus(200)

    const updatedTransaction = await Transaction.query()
      .where('id', transaction.id)
      .preload('categories')
      .firstOrFail()

    assert.lengthOf(updatedTransaction.categories, 1)
    assert.equal(updatedTransaction.categories[0].id, categories[1].id)
  })

  test('Should update categories - add multiple categories', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()
    const transaction = await fixtures.createTransaction({
      categoryIds: [categories[0].id],
      referentId: referents[0].id,
    })

    const response = await client
      .put(`/transaction/${transaction.id}`)
      .loginAs(user)
      .json({
        invoice: transaction.invoice,
        date: '2025-01-15',
        referent: referents[0].name,
        categories: [categories[0].id, categories[1].id],
        amountExcludingTax: transaction.amountExcludingTax,
        amountAllTax: transaction.amountAllTax,
        currency: 'EUR',
        type: transaction.type,
      })
      .withInertia()

    response.assertStatus(200)

    const updatedTransaction = await Transaction.query()
      .where('id', transaction.id)
      .preload('categories')
      .firstOrFail()

    assert.lengthOf(updatedTransaction.categories, 2)
  })

  test('Should return to previous route and set error msg for non-existent transaction', async ({
    client,
  }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()

    const response = await client
      .put('/transaction/99999')
      .loginAs(user)
      .json({
        invoice: 'INV-001',
        date: '2025-01-15',
        referent: referents[0].name,
        categories: [categories[0].id],
        amountExcludingTax: 100,
        amountAllTax: 120,
        currency: 'EUR',
        type: TransactionType.RECIPE,
      })
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Transaction not found',
    })
  })

  test('Should not allow updating another user transaction', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(otherUser)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const userFixtures = new TransactionTestsFixtures(user)
    const { categories: userCategories, referents: userReferents } = await userFixtures.start()

    const response = await client
      .put(`/transaction/${transaction.id}`)
      .loginAs(user)
      .json({
        invoice: 'HACKED',
        date: '2025-01-15',
        referent: userReferents[0].name,
        categories: [userCategories[0].id],
        amountExcludingTax: 100,
        amountAllTax: 120,
        currency: 'EUR',
        type: TransactionType.RECIPE,
      })
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Transaction not found',
    })

    const originalTransaction = await Transaction.findOrFail(transaction.id)
    assert.notEqual(originalTransaction.invoice, 'HACKED')
  })

  test('Should fail validation with missing required fields', async ({ client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const response = await client
      .put(`/transaction/${transaction.id}`)
      .loginAs(user)
      .json({
        invoice: 'INV-001',
      })
      .withInertia()

    response.assertStatus(200)
  })
})
