import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Inertia - pages/profile/update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should update user locale and theme', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client
      .patch(`/user/${user.id}/profile`)
      .loginAs(user)
      .json({ locale: 'fr', theme: 'dark' })
      .withInertia()

    response.assertStatus(200)

    const updatedUser = await User.findOrFail(user.id)
    assert.equal(updatedUser.locale, 'fr')
    assert.equal(updatedUser.theme, 'dark')
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client
      .patch('/user/1/profile')
      .json({ locale: 'en', theme: 'dark' })
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
