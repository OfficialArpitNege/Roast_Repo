import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildCharacter } from './buildCharacter'
import { buildProfileCard, buildRepoCards, buildScanBeam, buildScanReadout, buildRoastCard } from './buildCards'
import { buildScrollTimeline } from './buildScrollTimeline'

const WALK_CYCLES = 5.0
const SWING = 0.5

export default function Experience() {
  const { scene, camera, gl } = useThree()
  const refs = useRef({}).current

  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
    gl.outputColorSpace = THREE.SRGBColorSpace
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.12

    scene.fog = new THREE.FogExp2(0xeaf1fb, 0.05)

    const disposables = []

    // --- soft light backdrop dome ---
    const backdropGeo = new THREE.SphereGeometry(40, 32, 32)
    const backdropMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        varying vec3 vPos;
        void main(){
          float h = normalize(vPos).y * 0.5 + 0.5;
          vec3 top = vec3(0.92,0.95,1.0);
          vec3 bot = vec3(0.83,0.88,0.97);
          vec3 col = mix(bot, top, smoothstep(0.0,1.0,h));
          gl_FragColor = vec4(col,1.0);
        }`,
    })
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat)
    scene.add(backdrop)
    disposables.push(() => { backdropGeo.dispose(); backdropMat.dispose() })

    // --- ground + grid ---
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf1f4fa, roughness: 0.5, metalness: 0.15 })
    const groundGeo = new THREE.PlaneGeometry(60, 60)
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)
    disposables.push(() => { groundGeo.dispose(); groundMat.dispose() })

    const grid = new THREE.GridHelper(60, 60, 0xd7e0ee, 0xe4eaf3)
    grid.position.y = 0.005
    grid.material.transparent = true
    grid.material.opacity = 0.55
    scene.add(grid)
    disposables.push(() => grid.dispose())

    // --- lighting ---
    const key = new THREE.SpotLight(0xffffff, 2.6, 20, Math.PI / 6, 0.45, 1.3)
    key.position.set(2.4, 4.4, 2.2)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.bias = -0.001
    scene.add(key, key.target)

    const rim = new THREE.SpotLight(0x9c8cf2, 3.2, 16, Math.PI / 5, 0.5, 1.5)
    rim.position.set(-2.2, 3.0, -3.2)
    scene.add(rim, rim.target)

    const fill = new THREE.PointLight(0x37c9be, 0.7, 10, 2)
    fill.position.set(-1.2, 1.2, 1.6)
    scene.add(fill)

    const amb = new THREE.AmbientLight(0xdfe8f7, 1.5)
    scene.add(amb)

    // --- particles ---
    const N = 220
    const posArr = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 16
      posArr[i * 3 + 1] = Math.random() * 5.5
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 3
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    const particleMat = new THREE.PointsMaterial({ color: 0xb9c6e6, size: 0.02, transparent: true, opacity: 0.5, sizeAttenuation: true })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)
    disposables.push(() => { particleGeo.dispose(); particleMat.dispose() })

    // --- character + laptop ---
    const { group: character, legL, legR, portal } = buildCharacter()
    character.position.set(0.1, 0, -12)
    scene.add(character)

    // --- floating UI cards ---
    const profileCard = buildProfileCard()
    const repoCards = buildRepoCards()
    const scanBeam = buildScanBeam()
    const scanReadout = buildScanReadout()
    const roastCard = buildRoastCard()
    scene.add(profileCard.mesh, scanBeam, scanReadout.mesh, roastCard.mesh)
    repoCards.forEach((c) => scene.add(c.mesh))

    // --- scroll-driven state ---
    const state = { walk: 0 }
    const cam = { x: 0, y: 1.6, z: 6, lx: 0, ly: 1.3, lz: -10 }
    const scanState = { count: 0 }
    camera.position.set(cam.x, cam.y, cam.z)

    const timeline = buildScrollTimeline({ character, state, cam, profileCard, repoCards, scanBeam, scanReadout, scanState, roastCard, rim })
    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 300)

    Object.assign(refs, { character, legL, legR, portal, particles, state, cam, key, rim })

    return () => {
      clearTimeout(refreshId)
      timeline.scrollTrigger && timeline.scrollTrigger.kill()
      timeline.kill()
      scene.remove(
        backdrop, ground, grid, key, key.target, rim, rim.target, fill, amb, particles, character,
        profileCard.mesh, scanBeam, scanReadout.mesh, roastCard.mesh
      )
      repoCards.forEach((c) => scene.remove(c.mesh))
      disposables.forEach((d) => d())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((threeState) => {
    const r = refs
    if (!r.character) return
    const t = threeState.clock.getElapsedTime()

    r.particles.rotation.y = t * 0.008

    const phase = r.state.walk * WALK_CYCLES * Math.PI * 2
    r.legL.hipPivot.rotation.x = Math.sin(phase) * SWING * (1 - r.state.walk * 0.15)
    r.legR.hipPivot.rotation.x = Math.sin(phase + Math.PI) * SWING * (1 - r.state.walk * 0.15)
    r.legL.kneePivot.rotation.x = Math.max(0, -Math.sin(phase + 0.6)) * 0.9
    r.legR.kneePivot.rotation.x = Math.max(0, -Math.sin(phase + Math.PI + 0.6)) * 0.9

    const bob = Math.sin(phase * 2) * 0.018 * (1 - r.state.walk * 0.4)
    r.character.position.y = Math.max(0, bob)
    r.character.rotation.y = Math.sin(phase * 0.5) * 0.018 * (1 - r.state.walk * 0.3) + Math.sin(t * 0.35) * 0.008

    r.portal.material.opacity = 0.6 + Math.sin(t * 2.2) * 0.2

    camera.position.set(r.cam.x, r.cam.y, r.cam.z)
    camera.lookAt(r.cam.lx, r.cam.ly, r.cam.lz)

    r.key.target.position.set(r.character.position.x, 1.2, r.character.position.z)
    r.rim.target.position.set(r.character.position.x, 1.2, r.character.position.z)
  })

  return null
}
