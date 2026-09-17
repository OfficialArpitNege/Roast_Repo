import { useNavigate } from 'react-router-dom'

export default function HUD() {
  const navigate = useNavigate()

  return (
    <div className="hud">
      <div className="relative w-full h-full">
        {/* Caption 1: Introduction */}
        <div className="caption fade-block" id="cap-1" style={{ top: '35%' }}>
          <div className="caption-card">
            <span className="tag">ROASTMYGITHUB // 001</span>
            <h1>
              Every dev has a<br />
              <span className="gradient-text">GitHub to answer for.</span>
            </h1>
            <span className="sub">
              Meet your AI reviewer. He's analyzed every commit message you regret and every repository you abandoned.
            </span>
          </div>
        </div>

        {/* Caption 2: Live Fetch */}
        <div
          className="caption fade-block"
          id="cap-2"
          style={{ top: '28%', right: '6vw', left: 'auto', textAlign: 'right' }}
        >
          <div className="caption-card align-right">
            <span className="tag tag-purple">002 // LIVE PROFILE FETCH</span>
            <h2>
              Your profile,<br />
              pulled up <span className="gradient-text-purple">live.</span>
            </h2>
            <span className="sub">
              Repos, followers, commit activity, language stats & that one green square from March.
            </span>
          </div>
        </div>

        {/* Caption 3: Deep Scan */}
        <div className="caption fade-block" id="cap-3" style={{ top: '15%' }}>
          <div className="caption-card">
            <span className="tag tag-cyan">003 // REPOSITORY SCAN</span>
            <h2>
              Reading every repo.<br />
              Judging <span className="gradient-text-cyan">silently.</span>
            </h2>
            <span className="sub">
              Analyzing documentation quality, activity consistency, naming conventions, and presentation.
            </span>
          </div>
        </div>

        {/* Caption 4: Pattern Analysis */}
        <div
          className="caption fade-block"
          id="cap-4"
          style={{ top: '15%', right: '6vw', left: 'auto', textAlign: 'right' }}
        >
          <div className="caption-card align-right">
            <span className="tag tag-fire">004 // PATTERN MATCHING</span>
            <h2>
              Analyzing commit habits.<br />
              <span className="gradient-text-fire">Synthesizing roast data.</span>
            </h2>
            <span className="sub" style={{ marginLeft: 'auto' }}>
              Cross-referencing documentation quality, project activity, and code presentation.
            </span>
          </div>
        </div>

        {/* Caption 5: Final CTA Verdict */}
        <div className="final-wrap fade-block" id="cap-5">
          <div className="final-card">
            <span className="tag tag-fire mx-auto">005 // THE VERDICT</span>
            <h2>Ready to get roasted?</h2>
            <p>Enter your GitHub username to generate a fun, savage Groq AI roast & detailed developer score.</p>
            <button onClick={() => navigate('/analyze')} id="cta-link" className="primary-btn">
              Roast My GitHub 🔥
            </button>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="scrollcue" id="scrollcue">
          <span>SCROLL TO BEGIN</span>
          <div className="bar" />
        </div>
      </div>
    </div>
  )
}

