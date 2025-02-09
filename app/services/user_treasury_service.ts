import Transaction from '#models/transaction'
import { TransactionType } from '#enums/TransactionType'

export default class UserTreasuryService {
  async retrieve(baseTreasury: number, userId: number, maxDate: string, operator = '<=') {
    const recipeStats = await Transaction.query()
      .where('userId', userId)
      .where('type', TransactionType.RECIPE)
      .andWhere('date', operator, maxDate)
      .sum('amount_all_tax as totalIncludingTaxes')
      .sum('amount_excluding_tax as totalExcludingTaxes')
      .first()

    const expenseStats = await Transaction.query()
      .where('userId', userId)
      .whereIn('type', [TransactionType.EXPENSE, TransactionType.SALARY])
      .andWhere('date', operator, maxDate)
      .sum('amount_all_tax as totalIncludingTaxes')
      .sum('amount_excluding_tax as totalExcludingTaxes')
      .first()

    // Extraire les valeurs des agrégations (peuvent être null si aucune transaction)
    const recipeIncludingTaxes = Number(recipeStats?.$extras.totalIncludingTaxes || 0)
    const recipeExcludingTaxes = Number(recipeStats?.$extras.totalExcludingTaxes || 0)
    const expenseIncludingTaxes = Number(expenseStats?.$extras.totalIncludingTaxes || 0)
    const expenseExcludingTaxes = Number(expenseStats?.$extras.totalExcludingTaxes || 0)

    return {
      base: baseTreasury,
      excludingTaxes: {
        current: baseTreasury + recipeExcludingTaxes - expenseExcludingTaxes,
        losses: expenseExcludingTaxes,
        gains: recipeExcludingTaxes,
      },
      includingTaxes: {
        current: baseTreasury + recipeIncludingTaxes - expenseIncludingTaxes,
        losses: expenseIncludingTaxes,
        gains: recipeIncludingTaxes,
      },
    }
  }
}
