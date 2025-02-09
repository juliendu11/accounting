import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Inertia - pages/login/destroy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should logout authenticated user and redirect to login', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.delete('/login').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.delete('/login').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
