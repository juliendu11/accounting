import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Inertia - pages/category/create', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should return create page', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/category/create').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('category/create')
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/category/create').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
