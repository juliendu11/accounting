import dayjs from 'dayjs'

export const getTrimesters = (year: number) => {
  const trimesters = []
  for (let i = 0; i < 4; i++) {
    const start = dayjs(`${year}-01-01`).add(i * 3, 'month')
    const end = start.add(2, 'month').endOf('month')
    trimesters.push({ min: start.toDate(), max: end.toDate() })
  }
  return trimesters
}

export const getMonths = (year: number) => {
  const months = []
  for (let i = 0; i < 12; i++) {
    const start = dayjs(`${year}-01-01`).add(i, 'month')
    const end = start.endOf('month')
    months.push({ min: start.toDate(), max: end.toDate() })
  }
  return months
}
