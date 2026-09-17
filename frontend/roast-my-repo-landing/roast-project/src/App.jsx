import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AnalyzePage from './pages/AnalyzePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/analyze" element={<AnalyzePage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  )
}
