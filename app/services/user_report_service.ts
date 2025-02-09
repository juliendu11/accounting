import Transaction from '#models/transaction'
import { TransactionType } from '#enums/TransactionType'
import { DateTime } from 'luxon'
import writeXlsxFile from 'write-excel-file'
import User from '#models/user'
import i18nManager from '@adonisjs/i18n/services/main'

interface MonthlyData {
  income: number
  expense: number
  balance: number
  treasury: number
  transactions: Transaction[]
}

export default class UserReportService {
  private calculateIncome(transactions: Transaction[]): number {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === TransactionType.RECIPE
        ? acc + transaction.amountExcludingTax
        : acc
    }, 0)
  }

  private calculateExpense(transactions: Transaction[]): number {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === TransactionType.EXPENSE
        ? acc + transaction.amountExcludingTax
        : acc
    }, 0)
  }

  private updateTreasury(currentTreasury: number, transaction: Transaction): number {
    if (transaction.type === TransactionType.RECIPE) {
      return currentTreasury + transaction.amountAllTax
    }
    return currentTreasury - transaction.amountAllTax
  }

  private getMonthName(year: number, monthIndex: number, locale: string): string {
    return new Date(year, monthIndex).toLocaleString(locale, { month: 'long' })
  }

  /**
   * Organize transactions by month for a given year
   */
  private organizeTransactionsByMonth(
    transactions: Transaction[],
    year: number
  ): Map<number, Transaction[]> {
    const monthsMap = new Map<number, Transaction[]>()

    for (let month = 1; month <= 12; month++) {
      monthsMap.set(month, [])
    }

    transactions.forEach((transaction) => {
      const transactionMonth = transaction.date.get('month')
      const transactionYear = transaction.date.get('year')

      if (transactionYear === year) {
        monthsMap.get(transactionMonth)?.push(transaction)
      }
    })

    return monthsMap
  }

  private calculateMonthlyData(
    monthsMap: Map<number, Transaction[]>,
    initialTreasury: number
  ): MonthlyData[] {
    const monthlyData: MonthlyData[] = []
    let runningTreasury = initialTreasury

    // Process months in order (1-12)
    for (let month = 1; month <= 12; month++) {
      const monthTransactions = monthsMap.get(month) || []

      const income = this.calculateIncome(monthTransactions)
      const expense = this.calculateExpense(monthTransactions)
      const balance = income - expense

      // Update treasury based on all transactions for this month
      monthTransactions.forEach((transaction) => {
        runningTreasury = this.updateTreasury(runningTreasury, transaction)
      })

      monthlyData.push({
        income,
        expense,
        balance,
        treasury: runningTreasury,
        transactions: monthTransactions,
      })
    }

    return monthlyData
  }

  async execute(user: User, year: number) {
    const locale = user.locale ?? 'en'
    const i18n = i18nManager.locale(locale)

    const maxDate = new Date(year, 12, 0)

    const HEADER_ROW = [
      {
        value: i18n.t('report.header.month'),
        fontWeight: 'bold',
      },
      {
        value: i18n.t('report.header.incomes'),
        fontWeight: 'bold',
        width: 500,
      },
      {
        value: i18n.t('report.header.expenses'),
        fontWeight: 'bold',
      },
      {
        value: i18n.t('report.header.monthly_balance'),
        fontWeight: 'bold',
      },
      {
        value: i18n.t('report.header.treasury'),
        fontWeight: 'bold',
      },
    ]

    const columns = [
      {
        column: i18n.t('report.header.month'),
        width: 15,
        type: String,
      },
      {
        column: i18n.t('report.header.incomes'),
        type: Number,
        width: 15,
      },
      {
        column: i18n.t('report.header.expenses'),
        width: 15,
        type: Number,
      },
      {
        column: i18n.t('report.header.monthly_balance'),
        width: 15,
        type: Number,
      },
      {
        column: i18n.t('report.header.treasury'),
        width: 15,
        type: Number,
      },
    ]

    const transactions = await Transaction.query()
      .where('user_id', user.id)
      .andWhere('date', '<=', DateTime.fromJSDate(maxDate).toFormat('yyyy-MM-dd'))

    // Organize transactions by month (single pass through data)
    const monthsMap = this.organizeTransactionsByMonth(transactions, year)
    const monthlyData = this.calculateMonthlyData(monthsMap, user.treasury)

    // Calculate yearly totals
    const yearTotalIncome = monthlyData.reduce((acc, data) => acc + data.income, 0)
    const yearTotalExpense = monthlyData.reduce((acc, data) => acc + data.expense, 0)
    const finalTreasury = monthlyData[11]?.treasury ?? user.treasury

    const rows = monthlyData.map((data, index) => [
      {
        type: String,
        value: this.getMonthName(year, index, locale),
      },
      {
        type: Number,
        value: data.income,
      },
      {
        type: Number,
        value: data.expense,
      },
      {
        type: Number,
        value: data.balance,
      },
      {
        type: Number,
        value: data.treasury,
      },
    ])

    const data = [
      HEADER_ROW,
      ...rows,
      [],
      [],
      [
        { value: i18n.t('report.footer.totals').toUpperCase(), bold: true },
        { type: Number, value: yearTotalIncome, backgroundColor: '#c6e0b4' },
        { type: Number, value: yearTotalExpense, backgroundColor: '#ff0000' },
      ],
      [
        { value: i18n.t('report.footer.yearly_balance').toUpperCase(), bold: true },
        { type: Number, value: finalTreasury, backgroundColor: '#a9d08e' },
      ],
    ]

    const blob = await writeXlsxFile(data as any, {
      columns,
    })

    const buffer = Buffer.from(await blob.arrayBuffer())

    return buffer
  }
}
