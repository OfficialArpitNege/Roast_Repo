import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * The single timeline that drives the whole sequence:
 * developer enters -> GitHub profile appears -> repos get scanned ->
 * analysis -> roast reveal -> CTA. Scrubbed to #scroll-space so it plays
 * as one continuous shot.
 */
export function buildScrollTimeline({ character, state, cam, profileCard, repoCards, scanBeam, scanReadout, scanState, roastCard, rim }) {
  function revealCaption(id, inAt, outAt) {
    master.to('#' + id, { opacity: 1, y: 0, duration: 0.07 }, inAt)
    master.to('#' + id, { opacity: 0, y: -14, duration: 0.07 }, outAt)
  }

  const master = gsap.timeline({
    scrollTrigger: { trigger: '#scroll-space', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  })

  master.to('#scrollcue', { opacity: 0, duration: 0.04 }, 0.02)

  // PHASE A — entrance & approach (0 -> 0.24)
  master.to(character.position, { z: -2.3, duration: 0.24, ease: 'none' }, 0)
  master.to(state, { walk: 1, duration: 0.24, ease: 'none' }, 0)
  master.to(cam, { x: 0, y: 1.55, z: 3.0, lx: 0, ly: 1.4, lz: -2.3, duration: 0.24, ease: 'power1.inOut' }, 0)
  revealCaption('cap-1', 0.02, 0.2)

  // PHASE B — GitHub profile card appears from the laptop (0.24 -> 0.42)
  master.to(profileCard.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.14, ease: 'back.out(1.6)' }, 0.26)
  master.to(profileCard.mesh.position, { y: 1.62, duration: 0.16, ease: 'power1.out' }, 0.26)
  master.to(cam, { x: 0.4, y: 1.58, z: 1.55, lx: 0.35, ly: 1.5, lz: -1.7, duration: 0.2, ease: 'power1.inOut' }, 0.24)
  revealCaption('cap-2', 0.27, 0.42)

  // PHASE C — repositories appear & get scanned (0.42 -> 0.66)
  master.to(cam, { x: 0.5, y: 1.42, z: 1.05, lx: 0.5, ly: 1.28, lz: -1.5, duration: 0.16, ease: 'power1.inOut' }, 0.42)
  master.to(scanReadout.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.08, ease: 'back.out(1.6)' }, 0.43)
  revealCaption('cap-3', 0.44, 0.65)

  repoCards.forEach((card, i) => {
    const t = 0.46 + i * 0.03
    master.to(card.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.09, ease: 'back.out(1.7)' }, t)
  })

  master.to(scanBeam.material, { opacity: 0.85, duration: 0.03 }, 0.55)
  master.to(scanBeam.position, { y: 1.18, duration: 0.16, ease: 'power1.inOut' }, 0.55)
  master.to(scanBeam.material, { opacity: 0.0, duration: 0.03 }, 0.71)

  master.to(scanState, {
    count: 47,
    duration: 0.24,
    ease: 'none',
    onUpdate: () => scanReadout.redraw('Scanning repositories… ' + Math.floor(scanState.count) + '/47'),
  }, 0.47)

  repoCards.forEach((card, i) => {
    const t = 0.56 + i * 0.045
    master.call(() => card.redraw(card.repo, true), null, t)
    master.to(card.mesh.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.05, yoyo: true, repeat: 1 }, t)
  })

  // PHASE D — analysis + roast reveal (0.66 -> 0.88)
  master.to(cam, { x: 0.42, y: 1.5, z: 0.68, lx: 0.45, ly: 1.5, lz: -1.4, duration: 0.14, ease: 'power1.inOut' }, 0.66)
  revealCaption('cap-4', 0.66, 0.82)

  master.to([profileCard.mesh.scale, ...repoCards.map((c) => c.mesh.scale)], { x: 0.001, y: 0.001, z: 0.001, duration: 0.08 }, 0.78)
  master.to(scanReadout.mesh.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.06 }, 0.78)
  master.to(rim, { intensity: 6, duration: 0.08 }, 0.8)
  master.to(roastCard.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.14, ease: 'back.out(1.8)' }, 0.8)
  master.to(cam, { x: 0.35, y: 1.5, z: 0.42, lx: 0.4, ly: 1.5, lz: -1.3, duration: 0.16, ease: 'power1.inOut' }, 0.82)

  // PHASE E — CTA (0.88 -> 1.0)
  master.to(cam, { x: 0.18, y: 1.5, z: 0.9, lx: 0.25, ly: 1.42, lz: -1.6, duration: 0.18, ease: 'power1.inOut' }, 0.88)
  revealCaption('cap-5', 0.9, 1.05)

  return master
}
