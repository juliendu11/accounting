import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { ReferentFactory } from '#database/factories/referent_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Referent from '#models/referent'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'

test.group('Inertia - pages/referent/destroy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should delete a referent', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const referent = await ReferentFactory.merge({
      name: 'Referent to delete',
      userId: user.id,
    }).create()

    const response = await client.delete(`/referent/${referent.id}`).loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertRedirectsTo('/referent')

    const deletedReferent = await Referent.find(referent.id)
    assert.isNull(deletedReferent)
  })

  test('Should not delete a referent linked to a transaction', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { referents } = await fixtures.start()
    await fixtures.createTransaction({ referentId: referents[0].id })

    const response = await client.delete(`/referent/${referents[0].id}`).loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertNotificationContains({
      type: 'error',
      message: 'This referent is linked to a transaction, you cannot delete it',
    })

    const existingReferent = await Referent.find(referents[0].id)
    assert.isNotNull(existingReferent)
  })

  test('Should return to previous route and set error msg for non-existent transaction', async ({
    client,
  }) => {
    const user = await UserFactory.create()

    const response = await client.delete('/referent/99999').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Referent not found',
    })
  })

  test('Should not allow deleting another user referent', async ({ assert, client }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const referent = await ReferentFactory.merge({
      name: 'Other user referent',
      userId: otherUser.id,
    }).create()

    const response = await client.delete(`/referent/${referent.id}`).loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Referent not found',
    })

    const existingReferent = await Referent.find(referent.id)
    assert.isNotNull(existingReferent)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.delete('/referent/1').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
