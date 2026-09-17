import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ThemeToggle from '../components/ThemeToggle.jsx'

const SCORE_LABELS = {
  documentation: { label: 'Documentation', icon: '📄' },
  activity: { label: 'Activity', icon: '⚡' },
  presentation: { label: 'Presentation', icon: '🎨' },
  projects: { label: 'Projects', icon: '📦' },
  cleanliness: { label: 'Cleanliness', icon: '🧹' },
}

function ScoreBar({ name, value }) {
  const info = SCORE_LABELS[name] || { label: name, icon: '📊' }
  const color =
    value >= 70 ? 'var(--mint)' : value >= 40 ? 'var(--lavender)' : 'var(--coral)'

  return (
    <div className="score-bar-row">
      <div className="score-bar-label">
        <span className="score-bar-icon">{info.icon}</span>
        <span>{info.label}</span>
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="score-bar-value" style={{ color }}>{value}</span>
    </div>
  )
}

function OverallScore({ value }) {
  const color =
    value >= 70 ? 'var(--mint)' : value >= 40 ? 'var(--lavender)' : 'var(--coral)'

  return (
    <div className="overall-score">
      <svg viewBox="0 0 120 120" className="overall-ring">
        <circle
          cx="60" cy="60" r="52"
          fill="none" stroke="var(--line)" strokeWidth="8"
        />
        <circle
          cx="60" cy="60" r="52"
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 327} 327`}
          transform="rotate(-90 60 60)"
          className="overall-ring-fill"
        />
      </svg>
      <div className="overall-number" style={{ color }}>
        {value}
      </div>
      <div className="overall-label">Overall Score</div>
    </div>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state?.data

  useEffect(() => {
    if (!data) navigate('/analyze', { replace: true })
  }, [data, navigate])

  if (!data) return null

  const { profile, stats, scores, problems, suggestions, roast } = data

  return (
    <div className="results-page">
      <nav className="nav">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          roast<span>my</span>repo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button className="cta" onClick={() => navigate('/analyze')}>
            Roast Another 🔥
          </button>
        </div>
      </nav>

      <div className="results-container">
        {/* ---------- Profile Card ---------- */}
        <section className="results-profile-card">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="results-avatar"
          />
          <div className="results-profile-info">
            <h1 className="results-name">{profile.name || profile.username}</h1>
            <p className="results-username mono">@{profile.username}</p>
            {profile.bio && <p className="results-bio">{profile.bio}</p>}
          </div>
          <div className="results-stats-row">
            <div className="results-stat">
              <span className="results-stat-num">{profile.publicRepos}</span>
              <span className="results-stat-label">Repos</span>
            </div>
            <div className="results-stat">
              <span className="results-stat-num">{profile.followers?.toLocaleString()}</span>
              <span className="results-stat-label">Followers</span>
            </div>
            <div className="results-stat">
              <span className="results-stat-num">{profile.following?.toLocaleString()}</span>
              <span className="results-stat-label">Following</span>
            </div>
            <div className="results-stat">
              <span className="results-stat-num">{stats.totalStars?.toLocaleString()}</span>
              <span className="results-stat-label">Stars</span>
            </div>
          </div>
        </section>

        {/* ---------- Score Overview ---------- */}
        <section className="results-scores-section">
          <div className="results-overall-wrap">
            <OverallScore value={scores.overall} />
          </div>
          <div className="results-breakdown">
            <h2 className="results-section-title">Score Breakdown</h2>
            {Object.entries(SCORE_LABELS).map(([key]) => (
              <ScoreBar key={key} name={key} value={scores[key]} />
            ))}
          </div>
        </section>

        {/* ---------- Roast ---------- */}
        <section className="results-roast-card">
          <h2 className="results-roast-title">
            🔥 The Roast
          </h2>

          <div className="results-roast-list">
            {roast
              ? roast
                  .split('\n')
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0)
                  .map((para, i) => {
                    const cleanText = para.replace(/^[\u2022\-\*\d\.]+\s*/, '')
                    const icons = ['🔥', '⚡', '💀', '🎯', '☣️']
                    const icon = icons[i % icons.length]
                    return (
                      <div className="results-roast-item" key={i}>
                        <span className="results-roast-icon">{icon}</span>
                        <p className="results-roast-item-text">{cleanText}</p>
                      </div>
                    )
                  })
              : null}
          </div>
        </section>

        {/* ---------- Problems ---------- */}
        {problems.length > 0 && (
          <section className="results-section">
            <h2 className="results-section-title">⚠️ Problems Found</h2>
            <ul className="results-list results-problems">
              {problems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- Suggestions ---------- */}
        {suggestions.length > 0 && (
          <section className="results-section">
            <h2 className="results-section-title">💡 Suggestions</h2>
            <ul className="results-list results-suggestions">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- Quick Stats ---------- */}
        <section className="results-section results-quick-stats">
          <h2 className="results-section-title">📊 Quick Stats</h2>
          <div className="results-chips">
            <div className="results-chip"><span>Original Repos</span><strong>{stats.originalRepos}</strong></div>
            <div className="results-chip"><span>Forked Repos</span><strong>{stats.forkedRepos}</strong></div>
            <div className="results-chip"><span>Active (90d)</span><strong>{stats.activeRepos}</strong></div>
            <div className="results-chip"><span>Stale</span><strong>{stats.staleRepos}</strong></div>
            <div className="results-chip"><span>Empty Repos</span><strong>{stats.emptyRepos}</strong></div>
            <div className="results-chip"><span>Abandoned</span><strong>{stats.abandonedRepos}</strong></div>
            {stats.languages?.length > 0 && (
              <div className="results-chip results-chip-wide">
                <span>Languages</span>
                <strong>{stats.languages.join(', ')}</strong>
              </div>
            )}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <div className="results-bottom-cta">
          <button
            className="primary-btn"
            onClick={() => navigate('/analyze')}
            id="roast-another-btn"
          >
            Roast Another GitHub 🔥
          </button>
        </div>
      </div>
    </div>
  )
}
