import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Transaction from '#models/transaction'
import Category from '#models/category'
import Referent from '#models/referent'
import UserTreasuryService from '#services/user_treasury_service'
import { inject } from '@adonisjs/core'

@inject()
export default class HomeController {
  constructor(protected userTreasuryService: UserTreasuryService) {}

  async index({ inertia, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const fromDate = request.input('date.from', DateTime.now().startOf('quarter').toISO())
    const toDate = request.input('date.to', DateTime.now().endOf('quarter').toISO())

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .preload('categories')
      .preload('referent')
      .preload('documents')
      .andWhereBetween('date', [fromDate, toDate])

    const transactionsDate = await Transaction.query()
      .where('userId', user.id)
      .select('date')
      .distinct('date')
      .orderBy('date', 'desc')

    let availableYears: string[] = ['2024']

    transactionsDate.forEach((transaction) => {
      const year = transaction.date.get('year').toString()

      if (!availableYears.includes(year)) {
        availableYears.push(year)
      }
    })

    const currentYear = new Date().getFullYear().toString()
    if (!availableYears.includes(currentYear)) {
      availableYears.push(currentYear)
    }

    const categories = await Category.query().where('userId', user.id)
    const referents = await Referent.query().where('userId', user.id)

    return inertia.render('home', {
      transactions,
      date: { from: fromDate, to: toDate },
      availableYears,
      treasury: await this.userTreasuryService.retrieve(user.treasury, user.id, toDate),
      categories,
      referents,
    })
  }
}
