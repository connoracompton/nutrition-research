import { useState } from 'react'
import { api } from '../api'
import { MEALS, round } from '../nutrients'

// Search USDA (through our server) and add a result to one of today's meals.
export default function FoodSearch({ onAdd }) {
  const [query, setQuery] = useState('')
  const [meal, setMeal] = useState('breakfast')
  const [results, setResults] = useState(null) // null = haven't searched yet
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()
    if (query.trim().length < 2) return
    setError('')
    setBusy(true)
    try {
      setResults(await api(`/foods/search?q=${encodeURIComponent(query.trim())}`))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h2>Log a food</h2>
      <form className="row" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search foods, e.g. banana"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search foods"
        />
        <select value={meal} onChange={(e) => setMeal(e.target.value)} aria-label="Meal">
          {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="primary" disabled={busy}>{busy ? 'Searching…' : 'Search'}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {results && results.length === 0 && <p className="muted">No foods matched “{query}”.</p>}
      {results && results.length > 0 && (
        <ul className="list">
          {results.map((food) => (
            <li key={food.fdcId}>
              <div>
                <strong>{food.name}</strong>
                <span className="muted">
                  per 100 g: {round(food.calories)} kcal · {round(food.protein)} g protein · {round(food.carbs)} g carbs · {round(food.fat)} g fat
                </span>
              </div>
              <button onClick={() => onAdd(food, meal)}>Add to {meal}</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
