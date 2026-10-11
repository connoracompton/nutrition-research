// Display info + reference daily targets (FDA Daily Values for a 2,000 kcal diet).
// In the real app these targets would come from each user's goals.
export const NUTRIENTS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', target: 2000 },
  { key: 'protein', label: 'Protein', unit: 'g', target: 50 },
  { key: 'carbs', label: 'Carbs', unit: 'g', target: 275 },
  { key: 'fat', label: 'Fat', unit: 'g', target: 78 },
  { key: 'fiber', label: 'Fiber', unit: 'g', target: 28 },
  { key: 'sodium', label: 'Sodium', unit: 'mg', target: 2300, isLimit: true },
]

export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack']

export const round = (n) => (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10)

// Today's date as YYYY-MM-DD in the user's own time zone.
export function todayString() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
