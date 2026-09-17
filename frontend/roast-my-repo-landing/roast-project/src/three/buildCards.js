import * as THREE from 'three'
import { makeCardMesh, roundRect } from './cardFactory'

export const REPO_DATA = [
  { name: 'portfolio-site', lang: 'TypeScript', dot: '#3178C6', stars: 12, desc: 'WIP since 2022' },
  { name: 'todo-app-47', lang: 'JavaScript', dot: '#F1C40F', stars: 2, desc: 'The 47th todo app' },
  { name: 'abandoned-ml-idea', lang: 'Python', dot: '#3572A5', stars: 38, desc: '2 commits. Big dreams.' },
]

export const ROAST_LINES = ['47 repos.', '3 finished.', 'Bold strategy.']

export function buildProfileCard() {
  const card = makeCardMesh(0.46, 0.3, 420, 280, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.97)'
    roundRect(ctx, 0, 0, w, h, 26)
    ctx.fill()
    ctx.strokeStyle = 'rgba(35,42,59,0.08)'
    ctx.lineWidth = 2
    roundRect(ctx, 1, 1, w - 2, h - 2, 26)
    ctx.stroke()

    const cx = 64, cy = 64, r = 38
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
    grad.addColorStop(0, '#9C8CF2')
    grad.addColorStop(1, '#37C9BE')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = "700 26px 'Space Grotesk', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CW', cx, cy + 2)

    ctx.textAlign = 'left'
    ctx.fillStyle = '#232A3B'
    ctx.font = "700 26px 'Space Grotesk', sans-serif"
    ctx.fillText('Cass Wanderer', 118, 46)
    ctx.fillStyle = '#8B93A6'
    ctx.font = "500 17px 'JetBrains Mono', monospace"
    ctx.fillText('@codewanderer', 118, 74)

    const stats = [['47', 'Repos'], ['128', 'Followers'], ['89', 'Following']]
    const sw = (w - 40) / 3
    stats.forEach((s, i) => {
      const sx = 20 + sw * i + sw / 2
      ctx.textAlign = 'center'
      ctx.fillStyle = '#232A3B'
      ctx.font = "700 30px 'Space Grotesk', sans-serif"
      ctx.fillText(s[0], sx, 150)
      ctx.fillStyle = '#8B93A6'
      ctx.font = "500 14px 'JetBrains Mono', monospace"
      ctx.fillText(s[1], sx, 176)
    })

    ctx.strokeStyle = 'rgba(35,42,59,0.08)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(20, 200)
    ctx.lineTo(w - 20, 200)
    ctx.stroke()

    const gW = 13, gH = 6, cell = 16, gap = 4, gx = 20, gy = 214
    for (let r2 = 0; r2 < gH; r2++) {
      for (let c2 = 0; c2 < gW; c2++) {
        const v = Math.random()
        ctx.fillStyle = v > 0.8 ? '#1FA37E' : v > 0.55 ? '#37C9BE' : v > 0.3 ? '#BFE9DD' : '#EAF1EE'
        roundRect(ctx, gx + c2 * (cell + gap), gy + r2 * (cell + gap), cell, cell, 4)
        ctx.fill()
      }
    }
  })
  card.mesh.scale.set(0.0001, 0.0001, 0.0001)
  card.mesh.position.set(0.56, 1.68, -2.0)
  return card
}

function drawRepoCard(ctx, w, h, repo, scanned) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,0.97)'
  roundRect(ctx, 0, 0, w, h, 20)
  ctx.fill()
  ctx.strokeStyle = scanned ? 'rgba(55,201,190,0.55)' : 'rgba(35,42,59,0.08)'
  ctx.lineWidth = 2.5
  roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 20)
  ctx.stroke()

  ctx.fillStyle = '#232A3B'
  ctx.font = "700 20px 'Space Grotesk', sans-serif"
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(repo.name, 20, 42)

  ctx.fillStyle = '#8B93A6'
  ctx.font = "400 14px 'JetBrains Mono', monospace"
  ctx.fillText(repo.desc, 20, 68)

  ctx.beginPath()
  ctx.fillStyle = repo.dot
  ctx.arc(28, 96, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4b5468'
  ctx.font = "500 14px 'JetBrains Mono', monospace"
  ctx.fillText(repo.lang, 42, 101)
  ctx.textAlign = 'right'
  ctx.fillText('★ ' + repo.stars, w - 20, 101)

  if (scanned) {
    ctx.fillStyle = 'rgba(55,201,190,0.14)'
    roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 20)
    ctx.fill()
  }
}

export function buildRepoCards() {
  return REPO_DATA.map((repo, i) => {
    const card = makeCardMesh(0.3, 0.16, 320, 168, (ctx, w, h) => drawRepoCard(ctx, w, h, repo, false))
    card.mesh.scale.set(0.0001, 0.0001, 0.0001)
    card.mesh.position.set(0.3 + i * 0.34, 1.3, -1.85 - i * 0.02)
    return { ...card, repo, drawRepoCard }
  })
}

export function buildScanBeam() {
  const scanBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 0.05),
    new THREE.MeshBasicMaterial({ color: 0x37c9be, transparent: true, opacity: 0.0, toneMapped: false, blending: THREE.AdditiveBlending })
  )
  scanBeam.position.set(0.62, 1.42, -1.8)
  return scanBeam
}

export function buildScanReadout() {
  const card = makeCardMesh(0.42, 0.09, 420, 90, (ctx, w, h, label) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(35,42,59,0.9)'
    roundRect(ctx, 0, 0, w, h, 45)
    ctx.fill()
    ctx.fillStyle = '#EAF1EE'
    ctx.font = "600 26px 'JetBrains Mono', monospace"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label || 'Scanning repositories… 0/47', w / 2, h / 2)
  })
  card.mesh.scale.set(0.0001, 0.0001, 0.0001)
  card.mesh.position.set(0.62, 1.06, -1.78)
  return card
}

export function buildRoastCard() {
  const card = makeCardMesh(0.86, 0.5, 640, 380, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#FFF4F0')
    grad.addColorStop(1, '#FFEAF1')
    ctx.fillStyle = grad
    roundRect(ctx, 0, 0, w, h, 34)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,122,89,0.35)'
    ctx.lineWidth = 3
    roundRect(ctx, 2, 2, w - 4, h - 4, 34)
    ctx.stroke()

    ctx.fillStyle = '#FF7A59'
    ctx.font = "700 20px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('🔥 THE VERDICT', 34, 56)

    ctx.fillStyle = '#232A3B'
    ROAST_LINES.forEach((line, i) => {
      ctx.font = "700 52px 'Space Grotesk', sans-serif"
      ctx.fillText(line, 34, 128 + i * 62)
    })
  })
  card.mesh.scale.set(0.0001, 0.0001, 0.0001)
  card.mesh.position.set(0.45, 1.55, -1.55)
  return card
}
