import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { CategoryFactory } from '#database/factories/category_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Inertia - pages/category/index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should return index page with categories', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const categories = await CategoryFactory.merge([
      { name: 'Category A', userId: user.id },
      { name: 'Category B', userId: user.id },
    ]).createMany(2)

    const response = await client.get('/category').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('category/index')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.categories, 2)
    assert.equal(responseProps.categories[0].name, categories[0].name)
    assert.equal(responseProps.categories[1].name, categories[1].name)
  })

  test('Should return empty categories when none exist', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/category').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('category/index')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.categories, 0)
  })

  test('Should not return categories from other users', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    await CategoryFactory.merge([
      { name: 'User Category', userId: user.id },
    ]).create()

    await CategoryFactory.merge([
      { name: 'Other User Category', userId: otherUser.id },
    ]).create()

    const response = await client.get('/category').loginAs(user).withInertia()

    response.assertStatus(200)

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.categories, 1)
    assert.equal(responseProps.categories[0].name, 'User Category')
    assert.equal(responseProps.categories[0].userId, user.id)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/category').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
