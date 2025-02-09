import { HttpContext } from '@adonisjs/core/http'
import { createTransactionValidator, updateTransactionValidator } from '#validators/transaction'
import Transaction from '#models/transaction'
import Category from '#models/category'
import db from '@adonisjs/lucid/services/db'
import Referent from '#models/referent'
import app from '@adonisjs/core/services/app'
import * as fs from 'node:fs/promises'
import TransactionDocument from '#models/transaction_document'
import { DateTime } from 'luxon'

export default class TransactionController {
  async create({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const categories = await Category.query().where('userId', user.id)
    const referents = await Referent.query().where('userId', user.id)

    return inertia.render('transaction/create', {
      categories,
      referents,
    })
  }

  private async saveDocuments(documents: any[], user: any, transaction: Transaction) {
    const relativePath = `uploads/users/${user.id}/transactions/${transaction.id}/`
    const directoryPath = app.makePath(relativePath)
    await fs.mkdir(directoryPath, { recursive: true })

    await Promise.all(
      documents.map(async (document) => {
        const documentPath = `${relativePath}/${document.clientName}`
        await document.move(directoryPath)

        await TransactionDocument.create({
          transactionId: transaction.id,
          name: document.clientName,
          type: document.type,
          path: documentPath,
        })
      })
    )
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createTransactionValidator)
    const user = auth.getUserOrFail()

    const newTransaction = await db.transaction(async (trx) => {
      let referent

      if (payload.referent) {
        referent = await Referent.firstOrCreate(
          { userId: user.id, name: payload.referent },
          {
            userId: user.id,
            name: payload.referent,
          },
          { client: trx }
        )
      }

      const transaction = await Transaction.create(
        {
          userId: user.id,
          invoice: payload.invoice,
          referentId: referent?.id ?? undefined,
          date: DateTime.fromJSDate(payload.date),
          amountExcludingTax: payload.amountExcludingTax,
          amountAllTax: payload.amountAllTax,
          currency: payload.currency,
          comment: payload.comment,
          type: payload.type,
        },
        { client: trx }
      )

      if (payload.categories) {
        await transaction.related('categories').attach(payload.categories, trx)
      }

      return transaction
    })

    if (payload.documents) {
      await this.saveDocuments(payload.documents, user, newTransaction)
    }

    return response.redirect().toRoute('home.index')
  }

  async destroy({ params, response, auth, session, i18n }: HttpContext) {
    const user = auth.getUserOrFail()

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .andWhere('id', params.id)
      .first()

    if (!transaction) {
      session.flash('notification', {
        type: 'error',
        message: i18n.t('messages.transaction_not_found_error'),
      })
      return response.redirect().back()
    }

    await db.transaction(async (trx) => {
      transaction.useTransaction(trx)
      await transaction.related('categories').detach(undefined, trx)
      await transaction.delete()
    })

    return response.redirect().back()
  }

  async show({ params, auth, inertia, session, response, i18n }: HttpContext) {
    const user = auth.getUserOrFail()

    const categories = await Category.query().where('userId', user.id)
    const referents = await Referent.query().where('userId', user.id)

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .andWhere('id', params.id)
      .preload('categories')
      .preload('referent')
      .first()

    if (!transaction) {
      session.flash('notification', {
        type: 'error',
        message: i18n.t('messages.transaction_not_found_error'),
      })
      return response.redirect().back()
    }

    return inertia.render('transaction/item', {
      categories,
      transaction: transaction,
      referents,
    })
  }

  async update({ params, auth, request, response, session, i18n }: HttpContext) {
    const payload = await request.validateUsing(updateTransactionValidator)
    const user = auth.getUserOrFail()

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .andWhere('id', params.id)
      .preload('categories')
      .first()

    if (!transaction) {
      session.flash('notification', {
        type: 'error',
        message: i18n.t('messages.transaction_not_found_error'),
      })
      return response.redirect().back()
    }

    const updateTransaction = await db.transaction(async (trx) => {
      transaction.useTransaction(trx)

      const referent = await Referent.firstOrCreate(
        { userId: user.id, name: payload.referent },
        {
          userId: user.id,
          name: payload.referent,
        },
        { client: trx }
      )

      await transaction
        .useTransaction(trx)
        .merge({
          invoice: payload.invoice,
          referentId: referent.id,
          date: DateTime.fromJSDate(payload.date),
          amountExcludingTax: payload.amountExcludingTax,
          amountAllTax: payload.amountAllTax,
          currency: payload.currency,
          comment: payload.comment,
          type: payload.type,
        })
        .save()

      const currentCategories = transaction.categories.map((cat) => cat.id)

      if (payload.categories) {
        const categoriesDeleted = currentCategories.filter(
          (categoryId) => !payload.categories.includes(categoryId)
        )
        const categoriesAdded = payload.categories.filter((cat) => !currentCategories.includes(cat))

        if (categoriesAdded.length !== 0) {
          await transaction.related('categories').attach(categoriesAdded, trx)
        }
        if (categoriesDeleted.length !== 0) {
          await transaction.related('categories').detach(categoriesDeleted, trx)
        }
      }

      if (!payload.categories && transaction.categories.length !== 0) {
        await transaction.related('categories').detach(undefined, trx)
      }

      return transaction
    })

    if (payload.documents) {
      await this.saveDocuments(payload.documents, user, updateTransaction)
    }

    return response.redirect().toRoute('home.index')
  }

  /**
   * Download transaction file - API mode
   */
  async file({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const transaction = await Transaction.query()
      .where('userId', user.id)
      .andWhere('id', params.id)
      .preload('documents')
      .first()

    if (!transaction) {
      return response.notFound()
    }

    const transactionDocument = await TransactionDocument.query()
      .where('transactionId', transaction.id)
      .andWhere('id', params.fileId)
      .first()

    if (!transactionDocument) {
      return response.notFound()
    }

    const filePath = app.makePath(transactionDocument.path)

    return response.download(filePath)
  }
}
