import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

function MakeoverSimulatorView({ profile, stats, scores, problems, makeover, onRescan }) {
  const [isSimulating, setIsSimulating] = useState(true)
  const [simStep, setSimStep] = useState(0)
  const [activeTab, setActiveTab] = useState('recommended') // 'current' | 'recommended'
  const [displayedScore, setDisplayedScore] = useState(scores.overall)

  const steps = [
    'Scanning current profile presentation...',
    'Identifying documentation & README gaps...',
    'Simulating ideal profile structure...',
    'Calculating potential score boost...',
  ]

  useEffect(() => {
    setIsSimulating(true)
    setSimStep(0)
    
    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev < steps.length - 1) return prev + 1
        clearInterval(interval)
        setTimeout(() => setIsSimulating(false), 350)
        return prev
      })
    }, 400)

    return () => clearInterval(interval)
  }, [makeover])

  const targetScore = makeover?.potential_score || Math.min(98, scores.overall + 25)

  useEffect(() => {
    if (isSimulating) return
    let current = scores.overall
    const step = Math.ceil((targetScore - current) / 20) || 1
    const timer = setInterval(() => {
      current += step
      if (current >= targetScore) {
        setDisplayedScore(targetScore)
        clearInterval(timer)
      } else {
        setDisplayedScore(current)
      }
    }, 25)
    return () => clearInterval(timer)
  }, [isSimulating, targetScore, scores.overall])

  if (isSimulating) {
    return (
      <div className="makeover-simulating-loader">
        <div className="sim-spinner" />
        <h3 className="sim-loader-title">✨ Simulating Profile Makeover...</h3>
        <p className="sim-loader-step">{steps[simStep]}</p>
        <div className="sim-progress-bar">
          <div
            className="sim-progress-fill"
            style={{ width: `${((simStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="makeover-dashboard">
      {/* 1. Score Impact Highlight */}
      <section className="results-section makeover-score-comparison">
        <div className="makeover-score-grid">
          <div className="current-score-box">
            <span className="score-box-label">Current Audit</span>
            <div className="score-box-val">{scores.overall}</div>
          </div>

          <div className="score-arrow">➔</div>

          <div className="potential-score-box">
            <span className="score-box-label">Simulated Potential</span>
            <div className="score-box-val">{displayedScore}</div>
            <span className="score-box-sub text-mint">
              +{targetScore - scores.overall} pts potential boost
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Profile Simulator Preview */}
      <section className="results-section">
        <div className="makeover-preview-header">
          <h2 className="results-section-title">✨ Profile Makeover Preview</h2>
          <div className="makeover-tab-toggle">
            <button
              className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Current Profile
            </button>
            <button
              className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              ✨ Recommended Makeover
            </button>
          </div>
        </div>

        <div className="mock-profile-card">
          <div className="mock-profile-header">
            <img src={profile.avatar} alt="Avatar" className="mock-avatar" />
            <div>
              <h3 className="mock-name">{profile.name || profile.username}</h3>
              <p className="mock-username">@{profile.username}</p>
            </div>
          </div>

          {/* Dynamic Bio / Tagline */}
          <div className="mock-tagline-box">
            <span className="mock-tagline-label">
              {activeTab === 'recommended' ? '✨ Recommended Tagline' : 'Current Bio'}
            </span>
            <p className="mock-tagline">
              {activeTab === 'recommended'
                ? makeover?.profile_preview?.tagline || `Full-Stack Developer focused on high-performance web applications.`
                : profile.bio || '❌ No bio set'}
            </p>
          </div>

          {/* Tech Badges */}
          <div className="mock-tech-stack">
            <span className="mock-tech-label">🛠 Technology Highlights:</span>
            <div className="mock-tech-badges">
              {(activeTab === 'recommended'
                ? makeover?.profile_preview?.featured_tech || stats.languages || ['JavaScript', 'React', 'Node.js']
                : stats.languages || ['JavaScript']
              ).map((tech, i) => (
                <span className="mock-tech-badge" key={i}>{tech}</span>
              ))}
            </div>
          </div>

          {/* Featured Repositories Showcase */}
          <div className="mock-pinned-section">
            <span className="mock-pinned-label">📌 Featured Showcase Repositories:</span>
            <div className="mock-pinned-grid">
              {(makeover?.profile_preview?.featured_projects?.length > 0
                ? makeover.profile_preview.featured_projects
                : (stats.sampleRepos || []).slice(0, 3).map((r) => ({
                    name: r.name,
                    description: r.description || 'Main project repository',
                    tech: r.language || 'JavaScript',
                  }))
              ).map((p, i) => (
                <div className="mock-project-card" key={i}>
                  <div className="mock-proj-name">📁 {p.name}</div>
                  <p className="mock-proj-desc">
                    {activeTab === 'recommended'
                      ? p.description || 'Clear project summary with installation guide & demo.'
                      : p.description || '⚠️ Missing description'}
                  </p>
                  <div className="mock-proj-meta">
                    <span>● {p.tech || 'Code'}</span>
                    <span className="mock-badge">
                      {activeTab === 'recommended' ? '✨ Polished' : 'Raw'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Priority Actions (Compact Grid) */}
      <section className="results-section">
        <h2 className="results-section-title">⚡ High-Impact Action Items</h2>
        <div className="makeover-priorities-list">
          {(makeover?.priority_actions?.length > 0
            ? makeover.priority_actions
            : problems.map((prob, i) => ({
                impact: i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low',
                action: prob,
                why: 'Improves completeness and clarity of your developer profile.',
              }))
          ).map((act, i) => (
            <div
              className={`makeover-priority-card impact-${act.impact?.toLowerCase() || 'medium'}`}
              key={i}
            >
              <div className="prio-header">
                <span className={`prio-badge ${act.impact?.toLowerCase() || 'medium'}`}>
                  {act.impact === 'High' ? '🔴' : act.impact === 'Medium' ? '🟡' : '🟢'}{' '}
                  {act.impact} Impact
                </span>
                <span className="prio-action">{act.action}</span>
              </div>
              {act.why && <p className="prio-reason">{act.why}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Repository Makeovers (Concise Side-by-Side Cards) */}
      {makeover?.repo_makeovers?.length > 0 && (
        <section className="results-section">
          <h2 className="results-section-title">📦 Selected Repository Makeovers</h2>
          <div className="repo-makeovers-grid">
            {makeover.repo_makeovers.map((rm, i) => (
              <div className="repo-makeover-card" key={i}>
                <div className="repo-makeover-header">
                  <h4 className="repo-name-title">📁 {rm.name}</h4>
                  <span className="repo-lang-badge">{rm.impact || 'Medium'} Impact</span>
                </div>

                <div className="repo-before-after">
                  <div className="repo-state-box current">
                    <span className="state-title">Current State</span>
                    <p className="state-text">{rm.current_status}</p>
                  </div>
                  <div className="repo-state-box recommended">
                    <span className="state-title">✨ Recommended Fix</span>
                    <p className="state-text">{rm.recommended_action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Clean CTA */}
      <section className="results-section makeover-rescan-card">
        <h3 className="rescan-title">🚀 Ready to Apply Your Makeover?</h3>
        <p className="rescan-subtitle">
          Make these quick changes on GitHub, then re-scan to recalculate your real audit score!
        </p>
        <button className="rescan-btn" onClick={onRescan}>
          🔄 Re-Scan My GitHub
        </button>
      </section>
    </div>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state?.data
  const [mode, setMode] = useState('roast') // 'roast' | 'recruiter'

  useEffect(() => {
    if (!data) navigate('/analyze', { replace: true })
  }, [data, navigate])

  if (!data) return null

  const { profile, stats, scores, problems, suggestions, roast, recruiter, makeover } = data

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

        {/* ---------- 3-Way Mode Switch Bar ---------- */}
        <div className="mode-toggle-bar">
          <button
            className={`mode-toggle-btn ${mode === 'roast' ? 'active-roast' : ''}`}
            onClick={() => setMode('roast')}
          >
            🔥 Roast Mode
          </button>
          <button
            className={`mode-toggle-btn ${mode === 'recruiter' ? 'active-recruiter' : ''}`}
            onClick={() => setMode('recruiter')}
          >
            💼 Recruiter Mode
          </button>
          <button
            className={`mode-toggle-btn ${mode === 'makeover' ? 'active-makeover' : ''}`}
            onClick={() => setMode('makeover')}
          >
            ✨ Makeover
          </button>
        </div>

        {/* ---------- ROAST MODE VIEW ---------- */}
        {mode === 'roast' && (
          <>
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
          </>
        )}

        {/* ---------- RECRUITER MODE VIEW ---------- */}
        {mode === 'recruiter' && (
          <>
            {recruiter ? (
              <div className="recruiter-dashboard">
                {/* 1. Professional Summary */}
                <section className="results-section recruiter-summary-card">
                  <h2 className="results-section-title">💼 Professional Summary</h2>
                  <p className="recruiter-summary-text">{recruiter.summary}</p>
                </section>

                {/* 2. Observed Strengths */}
                {recruiter.strengths?.length > 0 && (
                  <section className="results-section">
                    <h2 className="results-section-title">✨ Candidate Strengths</h2>
                    <ul className="results-list recruiter-strengths">
                      {recruiter.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 3. Recruiter Concerns */}
                {recruiter.concerns?.length > 0 && (
                  <section className="results-section">
                    <h2 className="results-section-title">⚠️ Recruiter Concerns</h2>
                    <ul className="results-list recruiter-concerns">
                      {recruiter.concerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 4. Recommended Improvements */}
                {recruiter.recommendations?.length > 0 && (
                  <section className="results-section">
                    <h2 className="results-section-title">🎯 Recommended Improvements</h2>
                    <div className="recruiter-recs-grid">
                      {recruiter.recommendations.map((rec, i) => {
                        const what = typeof rec === 'object' ? rec.what : rec
                        const why = typeof rec === 'object' ? rec.why : ''
                        const affects = typeof rec === 'object' ? rec.affects : ''
                        return (
                          <div className="recruiter-rec-card" key={i}>
                            <div className="rec-card-header">
                              <span className="rec-num">0{i + 1}</span>
                              <strong className="rec-what">{what}</strong>
                            </div>
                            {why && <p className="rec-why"><strong>Why it matters:</strong> {why}</p>}
                            {affects && <span className="rec-affects">Affects: {affects}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* 5. Project Presentation */}
                {recruiter.project_improvements?.length > 0 && (
                  <section className="results-section">
                    <h2 className="results-section-title">📦 Project Presentation Advice</h2>
                    <ul className="results-list recruiter-projects">
                      {recruiter.project_improvements.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            ) : (
              <section className="results-section recruiter-fallback-card">
                <div className="recruiter-fallback-content">
                  <span style={{ fontSize: '32px' }}>💼</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '18px' }}>Recruiter Analysis Unavailable</h3>
                  <p style={{ margin: 0, color: 'var(--ink-dim)' }}>
                    Recruiter analysis is temporarily unavailable. Your roast is still ready 🔥
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        {/* ---------- MAKEOVER SIMULATOR VIEW ---------- */}
        {mode === 'makeover' && (
          <MakeoverSimulatorView
            profile={profile}
            stats={stats}
            scores={scores}
            problems={problems}
            makeover={makeover}
            onRescan={() => navigate('/analyze')}
          />
        )}

        {/* ---------- Quick Stats (Shared across all modes) ---------- */}
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
