import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Category from '#models/category'

test.group('Inertia - pages/category/store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should create a category', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/category')
      .loginAs(user)
      .json({
        name: 'New Category',
      })
      .withInertia()

    response.assertStatus(200)
    response.assertRedirectsTo('/category')

    const category = await Category.query()
      .where('userId', user.id)
      .where('name', 'New Category')
      .firstOrFail()

    assert.equal(category.name, 'New Category')
    assert.equal(category.userId, user.id)
  })

  test('Should trim category name', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/category')
      .loginAs(user)
      .json({
        name: '  Trimmed Category  ',
      })
      .withInertia()

    response.assertStatus(200)

    const category = await Category.query()
      .where('userId', user.id)
      .firstOrFail()

    assert.equal(category.name, 'Trimmed Category')
  })

  test('Should fail validation with missing name', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/category').loginAs(user).json({})

    response.assertStatus(200)
  })

  test('Should fail validation with empty name', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/category')
      .loginAs(user)
      .json({
        name: '',
      })

    response.assertStatus(200)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client
      .post('/category')
      .json({
        name: 'Test Category',
      })
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
