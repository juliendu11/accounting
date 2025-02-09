import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Inertia - pages/account/index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should return account page with user data', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/account').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('account/index')

    const responseProps = response.inertiaProps

    assert.equal(responseProps.user.id, user.id)
    assert.equal(responseProps.user.email, user.email)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/account').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
