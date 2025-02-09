import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Inertia - pages/login/index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should return login page when not authenticated', async ({ client }) => {
    const response = await client.get('/login').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })

  test('Should redirect to home when already authenticated', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/login').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
  })
})
