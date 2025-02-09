import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { TransactionType } from '#enums/TransactionType'
import UserTreasuryService from '#services/user_treasury_service'
import { inject } from '@adonisjs/core'
import Transaction from '#models/transaction'

@inject()
export default class StatsWidgetController {
  constructor(protected userTreasuryService: UserTreasuryService) {}

  async overview({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year')
    const toDate = DateTime.fromObject({ year }).endOf('year')

    // Generate the list of months between fromDate and toDate
    const start = fromDate.startOf('month')
    const end = toDate.endOf('month')
    const months: string[] = []
    let cursor = start
    while (cursor <= end) {
      months.push(cursor.toFormat('yyyy-MM'))
      cursor = cursor.plus({ months: 1 })
    }

    const expensesByMonth: number[] = Array(months.length).fill(0)
    const recipesByMonth: number[] = Array(months.length).fill(0)
    const salariesByMonth: number[] = Array(months.length).fill(0)
    const treasuryByMonth: number[] = Array(months.length).fill(0)

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .preload('categories')
      .andWhereBetween('date', [fromDate.toISO()!, toDate.toISO()!])
      .orderBy('date', 'asc')

    const userTreasury = await this.userTreasuryService.retrieve(
      user.treasury,
      user.id,
      fromDate.toISO()!,
      '<'
    )

    let baseTreasury = taxInclude
      ? userTreasury.includingTaxes.current
      : userTreasury.excludingTaxes.current

    transactions.forEach((transaction) => {
      const month = transaction.date.toFormat('yyyy-MM')
      const monthIndex = months.indexOf(month)

      if (monthIndex === -1) return

      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax
      if (transaction.type === TransactionType.EXPENSE) {
        expensesByMonth[monthIndex] += amount
        baseTreasury -= amount
      }
      if (transaction.type === TransactionType.RECIPE) {
        recipesByMonth[monthIndex] += amount
        baseTreasury += amount
      }
      if (transaction.type === TransactionType.SALARY) {
        salariesByMonth[monthIndex] += amount
        baseTreasury -= amount
      }

      treasuryByMonth[monthIndex] = baseTreasury
    })

    return {
      categories: months,
      expensesByMonth: expensesByMonth.map((value) => Number(value.toFixed(2))),
      recipesByMonth: recipesByMonth.map((value) => Number(value.toFixed(2))),
      salariesByMonth: salariesByMonth.map((value) => Number(value.toFixed(2))),
      treasuryByMonth: treasuryByMonth.map((value) => Number(value.toFixed(2))),
    }
  }

  async treasury({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year')
    const toDate = DateTime.fromObject({ year }).endOf('year')

    // Generate the list of months between fromDate and toDate
    const start = fromDate.startOf('month')
    const end = toDate.endOf('month')
    const months: string[] = []
    let cursor = start
    while (cursor <= end) {
      months.push(cursor.toFormat('yyyy-MM'))
      cursor = cursor.plus({ months: 1 })
    }

    const treasuryByMonth: number[] = Array(months.length).fill(0)

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .preload('categories')
      .andWhereBetween('date', [fromDate.toISO()!, toDate.toISO()!])
      .orderBy('date', 'asc')

    const userTreasury = await this.userTreasuryService.retrieve(
      user.treasury,
      user.id,
      fromDate.toISO()!,
      '<'
    )

    let baseTreasury = taxInclude
      ? userTreasury.includingTaxes.current
      : userTreasury.excludingTaxes.current

    transactions.forEach((transaction) => {
      const month = transaction.date.toFormat('yyyy-MM')
      const monthIndex = months.indexOf(month)

      if (monthIndex === -1) return

      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax
      if (transaction.type === TransactionType.EXPENSE) {
        baseTreasury -= amount
      }
      if (transaction.type === TransactionType.RECIPE) {
        baseTreasury += amount
      }
      if (transaction.type === TransactionType.SALARY) {
        baseTreasury -= amount
      }

      treasuryByMonth[monthIndex] = baseTreasury
    })

    return {
      categories: months,
      treasuryByMonth: treasuryByMonth.map((value) => Number(value.toFixed(2))),
    }
  }

  async turnover({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year').toISO()
    const toDate = DateTime.fromObject({ year }).endOf('year').toISO()

    // Generate the list of months between fromDate and toDate
    const start = DateTime.fromISO(fromDate!).startOf('month')
    const end = DateTime.fromISO(toDate!).endOf('month')
    const months: string[] = []
    let cursor = start
    while (cursor <= end) {
      months.push(cursor.toFormat('yyyy-MM'))
      cursor = cursor.plus({ months: 1 })
    }

    const turnoverByMonth: number[] = Array(months.length).fill(0)

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .preload('categories')
      .andWhereBetween('date', [fromDate!, toDate!])
      .orderBy('date', 'asc')

    transactions.forEach((transaction) => {
      const month = transaction.date.toFormat('yyyy-MM')
      const monthIndex = months.indexOf(month)

      if (monthIndex === -1) return

      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax
      if (transaction.type === TransactionType.RECIPE) {
        turnoverByMonth[monthIndex] += amount
      }
    })

    return {
      categories: months,
      turnoverByMonth: turnoverByMonth.map((value) => Number(value.toFixed(2))),
    }
  }

  async expensesByCategory({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year').toISO()
    const toDate = DateTime.fromObject({ year }).endOf('year').toISO()

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .where('type', TransactionType.EXPENSE)
      .preload('categories')
      .andWhereBetween('date', [fromDate!, toDate!])

    const expensesByCategory: Record<string, number> = {}

    transactions.forEach((transaction) => {
      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax

      if (transaction.categories && transaction.categories.length > 0) {
        transaction.categories.forEach((category) => {
          const categoryName = category.name
          expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount
        })
      } else {
        //If no category, we use "Uncategorized"
        const categoryName = 'Uncategorized'
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount
      }
    })

    // Convert to tables for ApexChart pie
    const categories = Object.keys(expensesByCategory)
    const series = categories.map((category) => Number(expensesByCategory[category].toFixed(2)))

    return {
      expensesByCategory: series,
      categories: categories,
    }
  }

  async recipesByCategory({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year').toISO()
    const toDate = DateTime.fromObject({ year }).endOf('year').toISO()

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .where('type', TransactionType.RECIPE)
      .preload('categories')
      .andWhereBetween('date', [fromDate!, toDate!])

    const expensesByCategory: Record<string, number> = {}

    transactions.forEach((transaction) => {
      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax

      if (transaction.categories && transaction.categories.length > 0) {
        transaction.categories.forEach((category) => {
          const categoryName = category.name
          expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount
        })
      } else {
        // If no category, we use "Uncategorized"
        const categoryName = 'Uncategorized'
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount
      }
    })

    // Convert to tables for ApexChart pie
    const categories = Object.keys(expensesByCategory)
    const series = categories.map((category) => Number(expensesByCategory[category].toFixed(2)))

    return {
      expensesByCategory: series,
      categories: categories,
    }
  }

  async recipesExpensesRatio({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year').toISO()
    const toDate = DateTime.fromObject({ year }).endOf('year').toISO()

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .whereIn('type', [TransactionType.EXPENSE, TransactionType.RECIPE])
      .andWhereBetween('date', [fromDate!, toDate!])

    let totalExpenses = 0
    let totalRecipes = 0

    transactions.forEach((transaction) => {
      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax

      if (transaction.type === TransactionType.EXPENSE) {
        totalExpenses += amount
      } else if (transaction.type === TransactionType.RECIPE) {
        totalRecipes += amount
      }
    })

    // Convert to tables for ApexChart pie
    const categories = ['Dépenses', 'Recettes']
    const data = [Number(totalExpenses.toFixed(2)), Number(totalRecipes.toFixed(2))]

    return {
      data: data,
      categories: categories,
    }
  }

  async expensesByReferent({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year').toISO()
    const toDate = DateTime.fromObject({ year }).endOf('year').toISO()

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .where('type', TransactionType.EXPENSE)
      .preload('referent')
      .andWhereBetween('date', [fromDate!, toDate!])

    const expensesByReferent: Record<string, number> = {}

    transactions.forEach((transaction) => {
      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax

      if (transaction.referent) {
        const referentName = transaction.referent.name
        expensesByReferent[referentName] = (expensesByReferent[referentName] || 0) + amount
      } else {
        // If there is no referent, we use "No referent"
        const referentName = 'No referent'
        expensesByReferent[referentName] = (expensesByReferent[referentName] || 0) + amount
      }
    })

    // Convert to tables for ApexChart pie
    const referents = Object.keys(expensesByReferent)
    const series = referents.map((referent) => Number(expensesByReferent[referent].toFixed(2)))

    return {
      expensesByReferent: series,
      referents: referents,
    }
  }

  async recipesByReferent({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()

    const year = request.input('date.year', DateTime.now().year)
    const taxInclude = request.input('taxes.include', 'true') === 'true'

    const fromDate = DateTime.fromObject({ year }).startOf('year').toISO()
    const toDate = DateTime.fromObject({ year }).endOf('year').toISO()

    const transactions = await Transaction.query()
      .where('userId', user.id)
      .where('type', TransactionType.RECIPE)
      .preload('referent')
      .andWhereBetween('date', [fromDate!, toDate!])

    const recipesByReferent: Record<string, number> = {}

    transactions.forEach((transaction) => {
      const amount = taxInclude ? transaction.amountAllTax : transaction.amountExcludingTax

      if (transaction.referent) {
        const referentName = transaction.referent.name
        recipesByReferent[referentName] = (recipesByReferent[referentName] || 0) + amount
      } else {
        // If there is no referent, we use "No referent"
        const referentName = 'No referent'
        recipesByReferent[referentName] = (recipesByReferent[referentName] || 0) + amount
      }
    })

    // Convert to tables for ApexChart pie
    const referents = Object.keys(recipesByReferent)
    const series = referents.map((referent) => Number(recipesByReferent[referent].toFixed(2)))

    return {
      recipesByReferent: series,
      referents: referents,
    }
  }
}
