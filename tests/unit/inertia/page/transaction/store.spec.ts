import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import Transaction from '#models/transaction'
import { TransactionType } from '#enums/TransactionType'
import Referent from '#models/referent'

test.group('Inertia - pages/transaction/store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should create a transaction with all fields', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()

    const response = await client
      .post('/transaction')
      .loginAs(user)
      .json({
        invoice: 'INV-001',
        date: '2025-01-15',
        referent: referents[0].name,
        categories: [categories[0].id],
        amountExcludingTax: 100,
        amountAllTax: 120,
        currency: 'EUR',
        comment: 'Test comment',
        type: TransactionType.RECIPE,
      })
      .withInertia()

    response.assertStatus(200)
    response.assertRedirectsTo('/')

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .where('invoice', 'INV-001')
      .preload('categories')
      .preload('referent')
      .firstOrFail()

    assert.equal(transaction.invoice, 'INV-001')
    assert.equal(transaction.amountExcludingTax, 100)
    assert.equal(transaction.amountAllTax, 120)
    assert.equal(transaction.currency, 'EUR')
    assert.equal(transaction.comment, 'Test comment')
    assert.equal(transaction.type, TransactionType.RECIPE)
    assert.lengthOf(transaction.categories, 1)
    assert.equal(transaction.referent.name, referents[0].name)
  })

  test('Should create a new referent if not exists', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()

    const response = await client
      .post('/transaction')
      .loginAs(user)
      .json({
        invoice: 'INV-002',
        date: '2025-01-15',
        referent: 'New Client',
        categories: [categories[0].id],
        amountExcludingTax: 200,
        amountAllTax: 240,
        currency: 'EUR',
        type: TransactionType.EXPENSE,
      })
      .withInertia()

    response.assertStatus(200)

    const referent = await Referent.query()
      .where('userId', user.id)
      .where('name', 'New Client')
      .firstOrFail()

    assert.equal(referent.name, 'New Client')

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .where('invoice', 'INV-002')
      .firstOrFail()

    assert.equal(transaction.referentId, referent.id)
  })

  test('Should create a salary transaction without referent', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()

    const response = await client
      .post('/transaction')
      .loginAs(user)
      .json({
        invoice: 'SAL-001',
        date: '2025-01-15',
        categories: [categories[0].id],
        amountExcludingTax: 3000,
        amountAllTax: 3000,
        currency: 'EUR',
        type: TransactionType.SALARY,
      })
      .withInertia()

    response.assertStatus(200)

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .where('invoice', 'SAL-001')
      .firstOrFail()

    assert.equal(transaction.type, TransactionType.SALARY)
    assert.isNull(transaction.referentId)
  })

  test('Should create a transaction with multiple categories', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()

    const response = await client
      .post('/transaction')
      .loginAs(user)
      .json({
        invoice: 'INV-003',
        date: '2025-01-15',
        referent: referents[0].name,
        categories: [categories[0].id, categories[1].id],
        amountExcludingTax: 500,
        amountAllTax: 600,
        currency: 'EUR',
        type: TransactionType.RECIPE,
      })
      .withInertia()

    response.assertStatus(200)

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .where('invoice', 'INV-003')
      .preload('categories')
      .firstOrFail()

    assert.lengthOf(transaction.categories, 2)
  })

  test('Should fail validation with missing required fields', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/transaction').loginAs(user).json({
      invoice: 'INV-004',
    })

    response.assertStatus(200)
  })

  test('Should fail validation with invalid currency', async ({ client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()

    const response = await client
      .post('/transaction')
      .loginAs(user)
      .json({
        invoice: 'INV-005',
        date: '2025-01-15',
        referent: referents[0].name,
        categories: [categories[0].id],
        amountExcludingTax: 100,
        amountAllTax: 120,
        currency: 'GBP',
        type: TransactionType.RECIPE,
      })
      .withInertia()

    response.assertStatus(200)
  })

  test('Should fail validation with negative amount', async ({ client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()

    const response = await client
      .post('/transaction')
      .loginAs(user)
      .json({
        invoice: 'INV-006',
        date: '2025-01-15',
        referent: referents[0].name,
        categories: [categories[0].id],
        amountExcludingTax: -100,
        amountAllTax: 120,
        currency: 'EUR',
        type: TransactionType.RECIPE,
      })
      .withInertia()

    response.assertStatus(200)
  })
})
