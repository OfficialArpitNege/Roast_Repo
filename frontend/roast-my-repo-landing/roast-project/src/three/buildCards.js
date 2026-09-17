import * as THREE from 'three'
import { makeCardMesh, roundRect } from './cardFactory'

export const REPO_DATA = [
  { name: 'portfolio-site', lang: 'TypeScript', dot: '#3178C6', stars: 12, desc: 'WIP since 2022' },
  { name: 'todo-app-47', lang: 'JavaScript', dot: '#F1C40F', stars: 2, desc: 'The 47th todo app' },
  { name: 'abandoned-ml-idea', lang: 'Python', dot: '#3572A5', stars: 38, desc: '2 commits. Big dreams.' },
]

export const ROAST_LINES = ['Scan Complete.', 'Code Reviewed.', 'Verdict: Savage 🔥']

export function buildProfileCard() {
  const card = makeCardMesh(0.46, 0.3, 420, 280, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    
    // Card background: Dark futuristic glass
    ctx.fillStyle = 'rgba(13, 17, 23, 0.95)'
    roundRect(ctx, 0, 0, w, h, 26)
    ctx.fill()
    
    // Card border: Electric neon gradient line
    const borderGrad = ctx.createLinearGradient(0, 0, w, h)
    borderGrad.addColorStop(0, 'rgba(168, 85, 247, 0.6)')
    borderGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.6)')
    borderGrad.addColorStop(1, 'rgba(255, 85, 51, 0.6)')
    ctx.strokeStyle = borderGrad
    ctx.lineWidth = 3
    roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 26)
    ctx.stroke()

    // Avatar Circle
    const cx = 64, cy = 64, r = 38
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
    grad.addColorStop(0, '#a855f7')
    grad.addColorStop(1, '#00f0ff')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = "700 26px 'Space Grotesk', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CW', cx, cy + 2)

    // Name & Username
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = "700 26px 'Space Grotesk', sans-serif"
    ctx.fillText('Cass Wanderer', 118, 46)
    ctx.fillStyle = '#00f0ff'
    ctx.font = "500 17px 'JetBrains Mono', monospace"
    ctx.fillText('@codewanderer', 118, 74)

    // Stats
    const stats = [['47', 'Repos'], ['128', 'Followers'], ['89', 'Following']]
    const sw = (w - 40) / 3
    stats.forEach((s, i) => {
      const sx = 20 + sw * i + sw / 2
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffffff'
      ctx.font = "700 30px 'Space Grotesk', sans-serif"
      ctx.fillText(s[0], sx, 150)
      ctx.fillStyle = '#94a3b8'
      ctx.font = "500 14px 'JetBrains Mono', monospace"
      ctx.fillText(s[1], sx, 176)
    })

    // Separator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(20, 200)
    ctx.lineTo(w - 20, 200)
    ctx.stroke()

    // GitHub Activity Contribution Grid
    const gW = 13, gH = 6, cell = 16, gap = 4, gx = 20, gy = 214
    for (let r2 = 0; r2 < gH; r2++) {
      for (let c2 = 0; c2 < gW; c2++) {
        const v = Math.random()
        ctx.fillStyle = v > 0.8 ? '#39d353' : v > 0.55 ? '#26a641' : v > 0.3 ? '#006d32' : '#161b22'
        roundRect(ctx, gx + c2 * (cell + gap), gy + r2 * (cell + gap), cell, cell, 4)
        ctx.fill()
      }
    }
  })
  card.mesh.scale.set(0.0001, 0.0001, 0.0001)
  card.mesh.position.set(0.68, 1.68, -1.5)
  return card
}

function drawRepoCard(ctx, w, h, repo, scanned) {
  ctx.clearRect(0, 0, w, h)
  
  // Card base
  ctx.fillStyle = scanned ? 'rgba(15, 23, 42, 0.96)' : 'rgba(22, 27, 34, 0.94)'
  roundRect(ctx, 0, 0, w, h, 20)
  ctx.fill()
  
  // Border
  ctx.strokeStyle = scanned ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = scanned ? 3 : 2
  roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 20)
  ctx.stroke()

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = "700 20px 'Space Grotesk', sans-serif"
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(repo.name, 20, 42)

  // Description
  ctx.fillStyle = '#94a3b8'
  ctx.font = "400 14px 'JetBrains Mono', monospace"
  ctx.fillText(repo.desc, 20, 68)

  // Language Dot & Name
  ctx.beginPath()
  ctx.fillStyle = repo.dot
  ctx.arc(28, 96, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#cbd5e1'
  ctx.font = "500 14px 'JetBrains Mono', monospace"
  ctx.fillText(repo.lang, 42, 101)
  
  // Stars
  ctx.textAlign = 'right'
  ctx.fillStyle = '#fbbf24'
  ctx.fillText('★ ' + repo.stars, w - 20, 101)

  if (scanned) {
    ctx.fillStyle = 'rgba(0, 240, 255, 0.1)'
    roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 20)
    ctx.fill()
  }
}

export function buildRepoCards() {
  return REPO_DATA.map((repo, i) => {
    const card = makeCardMesh(0.3, 0.16, 320, 168, (ctx, w, h) => drawRepoCard(ctx, w, h, repo, false))
    card.mesh.scale.set(0.0001, 0.0001, 0.0001)
    card.mesh.position.set(0.48 + i * 0.34, 1.32, -1.45 - i * 0.02)
    return { ...card, repo, drawRepoCard }
  })
}

export function buildScanBeam() {
  const scanBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.06),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, toneMapped: false, blending: THREE.AdditiveBlending })
  )
  scanBeam.position.set(0.8, 1.42, -1.4)
  return scanBeam
}

export function buildScanReadout() {
  const card = makeCardMesh(0.42, 0.09, 420, 90, (ctx, w, h, label) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(10, 13, 20, 0.95)'
    roundRect(ctx, 0, 0, w, h, 45)
    ctx.fill()
    
    ctx.strokeStyle = '#00f0ff'
    ctx.lineWidth = 2
    roundRect(ctx, 1, 1, w - 2, h - 2, 45)
    ctx.stroke()

    ctx.fillStyle = '#00f0ff'
    ctx.font = "600 24px 'JetBrains Mono', monospace"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label || 'Scanning repositories… 0/47', w / 2, h / 2)
  })
  card.mesh.scale.set(0.0001, 0.0001, 0.0001)
  card.mesh.position.set(0.8, 1.04, -1.38)
  return card
}

export function buildRoastCard() {
  const card = makeCardMesh(0.86, 0.5, 640, 380, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    
    // Background: Hot fire dark gradient
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, 'rgba(25, 10, 20, 0.96)')
    grad.addColorStop(1, 'rgba(15, 10, 15, 0.98)')
    ctx.fillStyle = grad
    roundRect(ctx, 0, 0, w, h, 34)
    ctx.fill()
    
    // Border: Fiery neon glow gradient
    const bGrad = ctx.createLinearGradient(0, 0, w, 0)
    bGrad.addColorStop(0, '#ff5533')
    bGrad.addColorStop(0.5, '#a855f7')
    bGrad.addColorStop(1, '#ff3300')
    ctx.strokeStyle = bGrad
    ctx.lineWidth = 4
    roundRect(ctx, 2, 2, w - 4, h - 4, 34)
    ctx.stroke()

    // Verdict Badge
    ctx.fillStyle = '#ff5533'
    ctx.font = "700 22px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('🔥 THE VERDICT', 34, 56)

    // Roast lines
    ROAST_LINES.forEach((line, i) => {
      ctx.fillStyle = i === 2 ? '#ff5533' : '#ffffff'
      ctx.font = "700 52px 'Space Grotesk', sans-serif"
      ctx.fillText(line, 34, 134 + i * 64)
    })
  })
  card.mesh.scale.set(0.0001, 0.0001, 0.0001)
  card.mesh.position.set(0.54, 1.55, -1.25)
  return card
}

