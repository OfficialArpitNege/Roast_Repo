import CanvasStage from '../three/CanvasStage.jsx'
import HUD from '../components/HUD.jsx'
import Loader from '../components/Loader.jsx'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <>
      <Loader />

      <CanvasStage />
      <div className="vignette" />
      <div className="grain" />

      <nav className="nav">
        <div className="logo">
          roast<span>my</span>repo
        </div>
        <button className="cta" onClick={() => navigate('/analyze')}>
          Roast My GitHub 🔥
        </button>
      </nav>

      {/* Tall scroll track — controls how much scrolling the whole cinematic
          sequence takes. #scroll-space is the ScrollTrigger target. */}
      <div id="scroll-space" />

      <HUD />
    </>
  )
}
