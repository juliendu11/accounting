import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { ReferentFactory } from '#database/factories/referent_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Inertia - pages/referent/index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should return index page with referents', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const referents = await ReferentFactory.merge([
      { name: 'Referent A', userId: user.id },
      { name: 'Referent B', userId: user.id },
    ]).createMany(2)

    const response = await client.get('/referent').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('referent/index')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.referents, 2)
    assert.equal(responseProps.referents[0].name, referents[0].name)
    assert.equal(responseProps.referents[1].name, referents[1].name)
  })

  test('Should return empty referents when none exist', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/referent').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('referent/index')

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.referents, 0)
  })

  test('Should not return referents from other users', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    await ReferentFactory.merge({ name: 'User Referent', userId: user.id }).create()
    await ReferentFactory.merge({ name: 'Other User Referent', userId: otherUser.id }).create()

    const response = await client.get('/referent').loginAs(user).withInertia()

    response.assertStatus(200)

    const responseProps = response.inertiaProps

    assert.lengthOf(responseProps.referents, 1)
    assert.equal(responseProps.referents[0].name, 'User Referent')
    assert.equal(responseProps.referents[0].userId, user.id)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.get('/referent').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
