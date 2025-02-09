import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import TransactionTestsFixtures from '#tests/unit/fixtures/transaction_tests_fixtures'
import TransactionDocument from '#models/transaction_document'
import app from '@adonisjs/core/services/app'
import * as fs from 'node:fs/promises'

test.group('Inertia - pages/transaction/file', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('Should download transaction file', async ({ assert, client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const relativePath = `uploads/users/${user.id}/transactions/${transaction.id}/`
    const directoryPath = app.makePath(relativePath)
    await fs.mkdir(directoryPath, { recursive: true })

    const testFileName = 'test-invoice.pdf'
    const testFilePath = `${directoryPath}${testFileName}`
    const testFileContent = 'Test PDF content'
    await fs.writeFile(testFilePath, testFileContent)

    const document = await TransactionDocument.create({
      transactionId: transaction.id,
      name: testFileName,
      type: 'application/pdf',
      path: `${relativePath}${testFileName}`,
    })

    const response = await client
      .get(`/transaction/${transaction.id}/file/${document.id}`)
      .loginAs(user)

    const body = response.body()

    response.assertStatus(200)
    assert.equal(Buffer.from(body).toString(), testFileContent)

    await fs.rm(directoryPath, { recursive: true, force: true })
  })

  test('Should return 404 error for non-existent transaction', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/transaction/99999/file/1').loginAs(user)

    response.assertStatus(404)
  })

  test('Should return 404 error for non-existent file', async ({ client }) => {
    const user = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(user)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const response = await client.get(`/transaction/${transaction.id}/file/99999`).loginAs(user)

    response.assertStatus(404)
  })

  test('Should not allow access to another user transaction file', async ({ client }) => {
    const user = await UserFactory.create()
    const otherUser = await UserFactory.create()

    const fixtures = new TransactionTestsFixtures(otherUser)
    await fixtures.start()
    const transaction = await fixtures.createTransaction()

    const document = await TransactionDocument.create({
      transactionId: transaction.id,
      name: 'test.pdf',
      type: 'application/pdf',
      path: 'uploads/test.pdf',
    })

    const response = await client
      .get(`/transaction/${transaction.id}/file/${document.id}`)
      .loginAs(user)

    response.assertStatus(404)
  })
})
