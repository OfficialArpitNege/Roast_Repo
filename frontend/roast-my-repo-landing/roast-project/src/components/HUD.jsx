import { useNavigate } from 'react-router-dom'

export default function HUD() {
  const navigate = useNavigate()

  return (
    <div className="hud">
      <div className="relative w-full h-full">
        <div className="caption fade-block" id="cap-1" style={{ top: '40%' }}>
          <span className="tag">ROASTMYREPO — 001</span>
          Every dev has
          <br />
          a <em>GitHub</em> to answer for.
          <span className="sub">Meet your reviewer. He's read every commit message you regret.</span>
        </div>

        <div
          className="caption fade-block"
          id="cap-2"
          style={{ top: '30%', right: '6vw', left: 'auto', textAlign: 'right' }}
        >
          <span className="tag">002 — PROFILE</span>
          Your profile,
          <br />
          pulled up <em>live.</em>
          <span className="sub" style={{ marginLeft: 'auto' }}>
            Repos, followers, that one green square from March. All of it.
          </span>
        </div>

        <div className="caption fade-block" id="cap-3" style={{ top: '12%' }}>
          <span className="tag">003 — SCANNING</span>
          Reading every repo.
          <br />
          Judging <em>silently.</em>
        </div>

        <div
          className="caption fade-block"
          id="cap-4"
          style={{ top: '10%', right: '6vw', left: 'auto', textAlign: 'right' }}
        >
          <span className="tag">004 — ANALYSIS</span>
          47 repos.
          <br />
          3 finished.
          <br />
          <em>Bold strategy.</em>
        </div>

        <div className="final-wrap fade-block" id="cap-5">
          <span className="tag">THE VERDICT IS IN</span>
          <h2>Ready to get roasted?</h2>
          <p>Connect your GitHub and find out what your commit history really says about you.</p>
          <button onClick={() => navigate('/analyze')} id="cta-link" className="primary-btn">
            Roast My GitHub 🔥
          </button>
        </div>

        <div className="scrollcue" id="scrollcue">
          <span>SCROLL</span>
          <div className="bar" />
        </div>
      </div>
    </div>
  )
}
