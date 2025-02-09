import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { CategoryFactory } from '#database/factories/category_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Category from '#models/category'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'

test.group('Inertia - pages/category/destroy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should delete a category', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const category = await CategoryFactory.merge({
      name: 'Category to delete',
      userId: user.id,
    }).create()

    const response = await client.delete(`/category/${category.id}`).loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertRedirectsTo('/category')

    const deletedCategory = await Category.find(category.id)
    assert.isNull(deletedCategory)
  })

  test('Should detach transactions when deleting category', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    const { categories } = await fixtures.start()
    const transaction = await fixtures.createTransaction({
      categoryIds: [categories[0].id],
    })

    const response = await client
      .delete(`/category/${categories[0].id}`)
      .loginAs(user)
      .withInertia()

    response.assertStatus(200)

    const deletedCategory = await Category.find(categories[0].id)
    assert.isNull(deletedCategory)

    await transaction.refresh()
    await transaction.load('categories')
    assert.lengthOf(transaction.categories, 0)
  })

  test('Should return to previous route and set error msg for non-existent category', async ({
    client,
  }) => {
    const user = await UserFactory.create()

    const response = await client.delete('/category/99999').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Category not found',
    })
  })

  test('Should return to previous route and set error msg for non-existent transaction for current user', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const category = await CategoryFactory.merge({
      name: 'Other user category',
      userId: otherUser.id,
    }).create()

    const response = await client.delete(`/category/${category.id}`).loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertNotificationContains({
      type: 'error',
      message: 'Category not found',
    })

    const existingCategory = await Category.find(category.id)
    assert.isNotNull(existingCategory)
  })

  test('Should redirect to login when not authenticated', async ({ client }) => {
    const response = await client.delete('/category/1').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })
})
