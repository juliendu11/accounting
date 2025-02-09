const TransactionType = {
  RECIPE: 'RECIPE',
  EXPENSE: 'EXPENSE',
  SALARY: 'SALARY',
} as const

export { TransactionType }

export type TransactionTypeType = (typeof TransactionType)[keyof typeof TransactionType]
