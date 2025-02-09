import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Referent from '#models/referent'

test.group('Inertia - pages/referent/store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should create a referent', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client
      .post('/referent')
      .loginAs(user)
      .json({ name: 'New Referent' })
      .withInertia()

    response.assertStatus(200)
    response.assertRedirectsTo('/referent')

    const referent = await Referent.query()
      .where('userId', user.id)
      .where('name', 'New Referent')
      .firstOrFail()

    assert.equal(referent.name, 'New Referent')
    assert.equal(referent.userId, user.id)
  })

  test('Should trim referent name', async ({ assert, client }) => {
    const user = await UserFactory.create()

    await client
      .post('/referent')
      .loginAs(user)
      .json({ name: '  Trimmed Referent  ' })
      .withInertia()

    const referent = await Referent.query().where('userId', user.id).firstOrFail()

    assert.equal(referent.name, 'Trimmed Referent')
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.post('/referent').json({ name: 'Test Referent' }).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
