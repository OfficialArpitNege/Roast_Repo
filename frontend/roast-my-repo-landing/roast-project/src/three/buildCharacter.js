import * as THREE from 'three'

/**
 * Builds the stylized developer character (glasses, blue shirt, dark
 * trousers) holding a laptop with a glowing screen "portal" — the surface
 * the GitHub profile / repo cards appear to emerge from. Returns the root
 * group plus every pivot the render loop needs for the walk cycle.
 */
export function buildCharacter() {
  const skinMat = new THREE.MeshPhysicalMaterial({ color: 0xe3ab86, roughness: 0.5, metalness: 0.02, clearcoat: 0.1 })
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b1d15, roughness: 0.6 })
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x5b7fde, roughness: 0.65, metalness: 0.05 })
  const cuffMat = new THREE.MeshStandardMaterial({ color: 0xf2efe7, roughness: 0.8 })
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.65 })
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x4a3527, roughness: 0.5 })
  const glassesMat = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.3, metalness: 0.4 })

  function limbMesh(rt, rb, len, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, len, 10), mat)
    m.castShadow = true
    return m
  }

  const character = new THREE.Group()

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.28, 0.76, 12), shirtMat)
  torso.position.y = 1.17
  torso.castShadow = true
  character.add(torso)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 18), skinMat)
  head.position.y = 1.74
  head.castShadow = true
  character.add(head)

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.185, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat)
  hair.position.set(0, 1.8, -0.01)
  character.add(hair)

  function makeGlasses() {
    const g = new THREE.Group()
    const rimGeo = new THREE.TorusGeometry(0.052, 0.008, 8, 16)
    const rimL = new THREE.Mesh(rimGeo, glassesMat)
    rimL.position.set(-0.065, 1.735, 0.155)
    const rimR = rimL.clone()
    rimR.position.x = 0.065
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), glassesMat)
    bridge.rotation.z = Math.PI / 2
    bridge.position.set(0, 1.735, 0.16)
    g.add(rimL, rimR, bridge)
    return g
  }
  character.add(makeGlasses())

  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.2, 12), pantsMat)
  hips.position.y = 0.79
  character.add(hips)

  function makeArm(side) {
    const shoulderPivot = new THREE.Group()
    shoulderPivot.position.set(side * 0.31, 1.47, 0.02)
    const upper = limbMesh(0.075, 0.065, 0.4, shirtMat)
    upper.position.y = -0.2
    shoulderPivot.add(upper)

    const elbowPivot = new THREE.Group()
    elbowPivot.position.y = -0.4
    shoulderPivot.add(elbowPivot)

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.03, 10), cuffMat)
    cuff.position.y = -0.01
    elbowPivot.add(cuff)

    const lower = limbMesh(0.058, 0.05, 0.36, skinMat)
    lower.position.y = -0.19
    elbowPivot.add(lower)

    const handPivot = new THREE.Group()
    handPivot.position.y = -0.37
    elbowPivot.add(handPivot)

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 10), skinMat)
    hand.castShadow = true
    handPivot.add(hand)

    character.add(shoulderPivot)
    return { shoulderPivot, elbowPivot, handPivot }
  }

  function makeLeg(side) {
    const hipPivot = new THREE.Group()
    hipPivot.position.set(side * 0.12, 0.79, 0)
    const upper = limbMesh(0.09, 0.075, 0.46, pantsMat)
    upper.position.y = -0.23
    hipPivot.add(upper)

    const kneePivot = new THREE.Group()
    kneePivot.position.y = -0.46
    hipPivot.add(kneePivot)

    const lower = limbMesh(0.075, 0.06, 0.44, pantsMat)
    lower.position.y = -0.22
    kneePivot.add(lower)

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.22), shoeMat)
    foot.position.set(0, -0.47, 0.05)
    foot.castShadow = true
    kneePivot.add(foot)

    character.add(hipPivot)
    return { hipPivot, kneePivot }
  }

  const armL = makeArm(-1)
  const armR = makeArm(1)
  const legL = makeLeg(-1)
  const legR = makeLeg(1)

  // he enters already holding the laptop — fixed pose, no arm-raise animation needed
  armL.shoulderPivot.rotation.x = -1.2
  armL.shoulderPivot.rotation.z = 0.22
  armL.elbowPivot.rotation.x = -1.15
  armR.shoulderPivot.rotation.x = -1.2
  armR.shoulderPivot.rotation.z = -0.22
  armR.elbowPivot.rotation.x = -1.15

  const contactGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({ color: 0x9c8cf2, transparent: true, opacity: 0.14 })
  )
  contactGlow.rotation.x = -Math.PI / 2
  contactGlow.position.y = 0.008
  character.add(contactGlow)

  // --- laptop, held between both hands ---
  const laptopGroup = new THREE.Group()
  character.add(laptopGroup)
  laptopGroup.position.set(0, 1.02, 0.34)
  laptopGroup.rotation.set(-0.15, 0, 0)

  const laptopBodyMat = new THREE.MeshPhysicalMaterial({ color: 0xd7dce6, roughness: 0.35, metalness: 0.5, clearcoat: 0.5 })
  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.24), laptopBodyMat)
  laptopBase.castShadow = true
  laptopGroup.add(laptopBase)

  const screenPivot = new THREE.Group()
  screenPivot.position.set(0, 0.01, -0.115)
  laptopGroup.add(screenPivot)
  const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.014), laptopBodyMat)
  laptopScreen.position.set(0, 0.1, -0.005)
  laptopScreen.rotation.x = -0.18
  screenPivot.add(laptopScreen)

  // glowing "portal" — the profile/repo/roast cards read as emerging from here
  const portalMat = new THREE.MeshBasicMaterial({ color: 0x8fb8ff, transparent: true, opacity: 0.85, toneMapped: false })
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.185), portalMat)
  portal.position.set(0, 0.1, 0.003)
  portal.rotation.x = -0.18
  laptopScreen.add(portal)

  return { group: character, armL, armR, legL, legR, portal }
}
