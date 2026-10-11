import { useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'
import { todayString } from './nutrients'
import AuthForm from './components/AuthForm'
import FoodSearch from './components/FoodSearch'
import DayLog from './components/DayLog'
import Totals from './components/Totals'

const EMPTY_DAY = { entries: [], totals: {} }

export default function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(getToken()))
  const [email, setEmail] = useState(localStorage.getItem('nutrition-email') ?? '')
  const [date, setDate] = useState(todayString())
  const [day, setDay] = useState(EMPTY_DAY)
  const [error, setError] = useState('')

  function logout() {
    setToken(null)
    localStorage.removeItem('nutrition-email')
    setLoggedIn(false)
    setDay(EMPTY_DAY)
  }

  // Runs an API call; an expired/invalid token sends the user back to login.
  const run = useCallback(async (call) => {
    setError('')
    try {
      return await call()
    } catch (err) {
      if (err.status === 401) logout()
      else setError(err.message)
    }
  }, [])

  // The server calculates the totals, so after every change we just re-fetch the day.
  const loadDay = useCallback(
    () => run(async () => setDay(await api(`/logs?date=${date}`))),
    [date, run],
  )

  useEffect(() => {
    if (loggedIn) loadDay()
  }, [loggedIn, loadDay])

  if (!loggedIn) {
    return (
      <AuthForm
        onLogin={({ token, user }) => {
          setToken(token)
          localStorage.setItem('nutrition-email', user.email)
          setEmail(user.email)
          setLoggedIn(true)
        }}
      />
    )
  }

  const addFood = (food, meal) =>
    run(async () => {
      await api('/logs', { method: 'POST', body: { ...food, meal, date, servings: 1 } })
      await loadDay()
    })
  const changeServings = (id, servings) =>
    run(async () => {
      await api(`/logs/${id}`, { method: 'PATCH', body: { servings } })
      await loadDay()
    })
  const deleteEntry = (id) =>
    run(async () => {
      await api(`/logs/${id}`, { method: 'DELETE' })
      await loadDay()
    })

  return (
    <>
      <header className="topbar">
        <h1>Nutrition Log</h1>
        <input type="date" value={date} max={todayString()} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Day" />
        <span className="muted email">{email}</span>
        <button onClick={logout}>Log out</button>
      </header>
      <main className="layout">
        {error && <p className="error" role="alert">{error}</p>}
        <Totals totals={day.totals} />
        <FoodSearch onAdd={addFood} />
        <DayLog entries={day.entries} onChangeServings={changeServings} onDelete={deleteEntry} />
      </main>
    </>
  )
}
