import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

test.group('Inertia - pages/login/store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should login with valid credentials and redirect to home', async ({ client }) => {
    const user = await UserFactory.merge({ confirmedAt: DateTime.now() }).create()

    const response = await client
      .post('/login')
      .json({ email: user.email, password: 'password123' })
      .withInertia()

    response.assertStatus(200)
    response.assertRedirectsTo('/')
  })

  test('Should not login with unconfirmed account', async ({ client }) => {
    const user = await UserFactory.merge({
      password: 'password123',
      locale: 'en',
    }).create()

    const response = await client
      .post('/login')
      .json({ email: user.email, password: 'password123' })
      .withInertia()

    response.assertStatus(200)
    response.assertNotificationContains({
      type: 'error',
      message: 'Your account has not been confirmed, the link has been sent to you by email',
    })
  })

  test('Should fail with invalid credentials', async ({ client }) => {
    const user = await UserFactory.merge({ confirmedAt: DateTime.now() }).create()

    const response = await client
      .post('/login')
      .json({ email: user.email, password: 'wrong_password' })
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
