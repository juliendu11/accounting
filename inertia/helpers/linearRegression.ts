/**
 * Computes a linear regression trend line over a sparse dataset.
 * @param data - Array of values, null means no data for that index
 * @returns Array of trend values for every index (including gaps)
 */
export function computeTrendLine(data: (number | null)[]): (number | null)[] {
  const points: { x: number; y: number }[] = []

  data.forEach((val, i) => {
    if (val !== null) points.push({ x: i, y: val })
  })

  if (points.length < 2) return data.map(() => null)

  const n = points.length
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return data.map((_, i) => Number((slope * i + intercept).toFixed(2)))
}
