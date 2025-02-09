import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class StatsController {
  public async index({ inertia }: HttpContext) {
    const availableYears = []

    const transactions = await db
      .from('transactions')
      .select(db.raw('DISTINCT YEAR(date) as year'))
      .orderBy('year', 'desc')

    for (const row of transactions) {
      availableYears.push(Number.parseInt(row.year))
    }

    return inertia.render('stats/index', {
      availableYears,
    })
  }
}
