import { MEALS, round } from '../nutrients'

// Everything logged for the selected day, grouped by meal, with edit + delete.
export default function DayLog({ entries, onChangeServings, onDelete }) {
  if (entries.length === 0) {
    return (
      <section className="card">
        <h2>Food log</h2>
        <p className="muted">Nothing logged for this day yet. Search for a food above to add it.</p>
      </section>
    )
  }
  return (
    <section className="card">
      <h2>Food log</h2>
      {MEALS.map((meal) => {
        const items = entries.filter((e) => e.meal === meal)
        if (items.length === 0) return null
        return (
          <div key={meal}>
            <h3>{meal}</h3>
            <ul className="list">
              {items.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.name}</strong>
                    <span className="muted">
                      {round(entry.calories * entry.servings)} kcal · {round(entry.protein * entry.servings)} g protein
                    </span>
                  </div>
                  <label className="servings">
                    <input
                      type="number"
                      min="0.25"
                      max="100"
                      step="0.25"
                      // `key` makes the box reset if the saved value changes.
                      key={entry.servings}
                      defaultValue={entry.servings}
                      onBlur={(e) => {
                        const value = Number(e.target.value)
                        if (value > 0 && value !== entry.servings) onChangeServings(entry.id, value)
                        else e.target.value = entry.servings
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                    />
                    × 100 g
                  </label>
                  <button className="danger" onClick={() => onDelete(entry.id)} aria-label={`Delete ${entry.name}`}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
