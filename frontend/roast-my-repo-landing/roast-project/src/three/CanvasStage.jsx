import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

export default function CanvasStage() {
  return (
    <div id="stage-canvas">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 38, near: 0.05, far: 100, position: [0, 1.6, 6] }}
      >
        <Experience />
      </Canvas>
    </div>
  )
}
