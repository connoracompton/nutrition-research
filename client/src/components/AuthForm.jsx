import { useState } from 'react'
import { api } from '../api'

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: { email, password } })
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const isLogin = mode === 'login'
  return (
    <main className="auth">
      <h1>Nutrition Log</h1>
      <p className="muted">Track what you eat and see how your day adds up.</p>
      <form className="card" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Log in' : 'Create an account'}</h2>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{isLogin ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError('') }}>
          {isLogin ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  )
}
