import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'

test.group('Inertia - pages/transaction/create', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should return create page with categories and referents', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories, referents } = await fixtures.start()

    const response = await client.get('/transaction/create').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('transaction/create')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.categories, 2)
    assert.lengthOf(responseProps.referents, 3)

    assert.equal(responseProps.categories[0].name, categories[0].name)
    assert.equal(responseProps.categories[1].name, categories[1].name)

    assert.equal(responseProps.referents[0].name, referents[0].name)
    assert.equal(responseProps.referents[1].name, referents[1].name)
    assert.equal(responseProps.referents[2].name, referents[2].name)
  })

  test('Should return empty categories and referents when none exist', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create()

    const response = await client.get('/transaction/create').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('transaction/create')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.categories, 0)
    assert.lengthOf(responseProps.referents, 0)
  })

  test('Should not return categories and referents from other users', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()

    const otherFixtures = new TransactionTestsFixtures(otherUser)
    await otherFixtures.start()

    const response = await client.get('/transaction/create').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('transaction/create')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.categories, 2)
    assert.lengthOf(responseProps.referents, 3)

    responseProps.categories.forEach((cat: any) => {
      assert.equal(cat.userId, user.id)
    })

    responseProps.referents.forEach((ref: any) => {
      assert.equal(ref.userId, user.id)
    })
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/transaction/create').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
