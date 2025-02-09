import vine from '@vinejs/vine'
import { TransactionType } from '#enums/TransactionType'

export const createTransactionValidator = vine.compile(
  vine.object({
    invoice: vine.string().trim(),
    date: vine.date(),
    referent: vine.string().trim().optional().requiredWhen('type', '!=', TransactionType.SALARY),
    categories: vine.array(vine.number()),
    amountExcludingTax: vine.number().positive(),
    amountAllTax: vine.number().positive(),
    currency: vine.enum(['EUR', 'USD']),
    comment: vine.string().trim().optional(),
    type: vine.enum(Object.values(TransactionType)),
    documents: vine
      .array(
        vine.file({
          size: '50mb',
          extnames: ['jpg', 'png', 'pdf'],
        })
      )
      .optional(),
  })
)

export const updateTransactionValidator = vine.compile(
  vine.object({
    invoice: vine.string().trim(),
    date: vine.date(),
    referent: vine.string().trim().optional().requiredWhen('type', '!=', TransactionType.SALARY),
    categories: vine.array(vine.number()),
    amountExcludingTax: vine.number().positive(),
    amountAllTax: vine.number().positive(),
    currency: vine.enum(['EUR', 'USD']),
    comment: vine.string().trim().optional(),
    type: vine.enum(Object.values(TransactionType)),
    documents: vine
      .array(
        vine.file({
          size: '50mb',
          extnames: ['jpg', 'png', 'pdf'],
        })
      )
      .optional(),
  })
)
