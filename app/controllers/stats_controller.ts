import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class StatsController {
  public async index({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    const availableYears = []

    const transactions = await db
      .from('transactions')
      .select(db.raw('DISTINCT YEAR(date) as year'))
      .orderBy('year', 'desc')

    for (const row of transactions) {
      availableYears.push(Number.parseInt(row.year))
    }

    const categoryRows = await db
      .from('categories')
      .where('user_id', user.id)
      .select('name')
      .orderBy('name', 'asc')

    const availableCategories = categoryRows.map((row: { name: string }) => row.name)

    const referentRows = await db
      .from('referents')
      .where('user_id', user.id)
      .select('name')
      .orderBy('name', 'asc')

    const availableReferents = referentRows.map((row: { name: string }) => row.name)

    return inertia.render('stats/index', {
      availableYears,
      availableCategories,
      availableReferents,
    })
  }
}
