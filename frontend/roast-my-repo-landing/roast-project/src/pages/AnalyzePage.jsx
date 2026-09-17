import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const LOADING_MESSAGES = [
  'Scanning repositories…',
  'Checking documentation…',
  'Analyzing activity…',
  'Judging your commit history…',
  'Preparing your roast… 🔥',
]

export default function AnalyzePage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingIdx, setLoadingIdx] = useState(0)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter a GitHub username.')
      return
    }

    setError('')
    setLoading(true)
    setLoadingIdx(0)

    // Cycle through loading messages
    const interval = setInterval(() => {
      setLoadingIdx((prev) => {
        if (prev < LOADING_MESSAGES.length - 1) return prev + 1
        return prev
      })
    }, 2200)

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      })

      const data = await res.json()
      clearInterval(interval)

      if (!res.ok) {
        setError(data.error || 'Failed to analyze user. Please try again.')
        setLoading(false)
        return
      }

      navigate('/results', { state: { data } })
    } catch (err) {
      clearInterval(interval)
      setLoading(false)

      if (err.message.includes('fetch') || err.message.includes('NetworkError') || err.name === 'TypeError') {
        setError('Cannot reach the server. Make sure the backend is running on ' + API_URL)
      } else {
        setError(err.message)
      }
    }
  }

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="analyze-page">
        <div className="analyze-loading">
          <div className="analyze-loading-spinner" />
          <p className="analyze-loading-msg" key={loadingIdx}>
            {LOADING_MESSAGES[loadingIdx]}
          </p>
          <div className="analyze-loading-dots">
            {LOADING_MESSAGES.map((_, i) => (
              <span
                key={i}
                className={`analyze-dot ${i <= loadingIdx ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ---------- Input Form ----------
  return (
    <div className="analyze-page">
      <nav className="nav">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          roast<span>my</span>repo
        </div>
        <ThemeToggle />
      </nav>

      <div className="analyze-card">
        <span className="tag">ROASTMYREPO — ANALYZE</span>
        <h1 className="analyze-title">
          Enter your <em>GitHub</em> username
        </h1>
        <p className="analyze-subtitle">
          We'll pull your public profile, scan every repo, and deliver a roast you didn't ask for.
        </p>

        <form onSubmit={handleSubmit} className="analyze-form">
          <div className="analyze-input-wrap">
            <span className="analyze-at">@</span>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              placeholder="github_username"
              className="analyze-input"
              autoFocus
              autoComplete="off"
              spellCheck="false"
              maxLength={39}
            />
          </div>

          {error && <p className="analyze-error">{error}</p>}

          <button type="submit" className="primary-btn analyze-btn" id="roast-btn">
            Roast Me 🔥
          </button>
        </form>

        <p className="analyze-disclaimer">
          Only public GitHub data is used. No login required.
        </p>
      </div>
    </div>
  )
}
