import { useEffect, useState } from 'react'

export default function Loader() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      id="loader"
      style={{
        opacity: hidden ? 0 : 1,
        visibility: hidden ? 'hidden' : 'visible',
      }}
    >
      <div className="mark" />
      <div className="label">WARMING UP THE ROAST</div>
    </div>
  )
}
