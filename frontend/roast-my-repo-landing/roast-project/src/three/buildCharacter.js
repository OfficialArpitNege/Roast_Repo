import * as THREE from 'three'

/**
 * Builds a detailed, realistic human developer model with realistic skin tones,
 * face details (eyes, nose, hair), modern apparel (collared hoodie/shirt, belt, sneakers),
 * and compact arm posture holding a sleek metal laptop.
 */
export function buildCharacter() {
  // Realistic physical materials
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xebbe9b,
    roughness: 0.4,
    metalness: 0.05,
    clearcoat: 0.25,
    clearcoatRoughness: 0.1,
  })
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f1712, roughness: 0.8 })
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x2b1e16, roughness: 0.2 })
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.1 })
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xff5533, roughness: 0.6 })
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 })
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 })
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  const glassesMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.6 })

  function limbMesh(rt, rb, len, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, len, 14), mat)
    m.castShadow = true
    return m
  }

  const character = new THREE.Group()

  // --- Torso & Neck ---
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.12, 12), skinMat)
  neck.position.y = 1.6
  neck.castShadow = true
  character.add(neck)

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.72, 14), shirtMat)
  torso.position.y = 1.18
  torso.castShadow = true
  character.add(torso)

  // Shirt V-neck collar & inner shirt detail
  const innerShirt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 12), innerMat)
  innerShirt.position.set(0, 1.46, 0.1)
  character.add(innerShirt)

  // --- Detailed Head & Face ---
  const headGroup = new THREE.Group()
  headGroup.position.set(0, 1.76, 0)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 24, 24), skinMat)
  head.scale.set(0.96, 1.08, 0.98)
  head.castShadow = true
  headGroup.add(head)

  // Nose
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.05, 8), skinMat)
  nose.position.set(0, -0.01, 0.165)
  nose.rotation.x = -0.2
  headGroup.add(nose)

  // Eyes
  function makeEye(side) {
    const eye = new THREE.Group()
    eye.position.set(side * 0.055, 0.025, 0.15)
    
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), eyeWhiteMat)
    sclera.scale.set(1.1, 0.7, 0.6)
    eye.add(sclera)

    const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.005, 10), irisMat)
    iris.rotation.x = Math.PI / 2
    iris.position.z = 0.012
    eye.add(iris)

    return eye
  }
  headGroup.add(makeEye(-1), makeEye(1))

  // Realistic Hair Style
  const hairBase = new THREE.Mesh(
    new THREE.SphereGeometry(0.172, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat
  )
  hairBase.position.set(0, 0.02, -0.005)
  headGroup.add(hairBase)

  // Hair strands/top volume
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.22), hairMat)
  hairTop.position.set(0, 0.14, 0.01)
  hairTop.rotation.x = 0.1
  headGroup.add(hairTop)

  // Glasses
  function makeGlasses() {
    const g = new THREE.Group()
    const rimGeo = new THREE.TorusGeometry(0.048, 0.007, 8, 16)
    const rimL = new THREE.Mesh(rimGeo, glassesMat)
    rimL.position.set(-0.055, 0.025, 0.16)
    const rimR = rimL.clone()
    rimR.position.x = 0.055
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6), glassesMat)
    bridge.rotation.z = Math.PI / 2
    bridge.position.set(0, 0.025, 0.165)
    g.add(rimL, rimR, bridge)
    return g
  }
  headGroup.add(makeGlasses())
  character.add(headGroup)

  // --- Belt & Hips ---
  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.16, 14), pantsMat)
  hips.position.y = 0.8
  character.add(hips)

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.04, 14), beltMat)
  belt.position.y = 0.86
  character.add(belt)

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.02), buckleMat)
  buckle.position.set(0, 0.86, 0.23)
  character.add(buckle)

  // --- Arms & Compact Pose (Prevents elbow collision with cards) ---
  function makeArm(side) {
    const shoulderPivot = new THREE.Group()
    shoulderPivot.position.set(side * 0.26, 1.45, 0.02)
    const upper = limbMesh(0.068, 0.058, 0.38, shirtMat)
    upper.position.y = -0.19
    shoulderPivot.add(upper)

    const elbowPivot = new THREE.Group()
    elbowPivot.position.y = -0.38
    shoulderPivot.add(elbowPivot)

    const lower = limbMesh(0.055, 0.046, 0.34, skinMat)
    lower.position.y = -0.17
    elbowPivot.add(lower)

    const handPivot = new THREE.Group()
    handPivot.position.y = -0.34
    elbowPivot.add(handPivot)

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), skinMat)
    hand.scale.set(0.9, 0.7, 1.1)
    hand.castShadow = true
    handPivot.add(hand)

    character.add(shoulderPivot)
    return { shoulderPivot, elbowPivot, handPivot }
  }

  function makeLeg(side) {
    const hipPivot = new THREE.Group()
    hipPivot.position.set(side * 0.11, 0.78, 0)
    const upper = limbMesh(0.088, 0.072, 0.44, pantsMat)
    upper.position.y = -0.22
    hipPivot.add(upper)

    const kneePivot = new THREE.Group()
    kneePivot.position.y = -0.44
    hipPivot.add(kneePivot)

    const lower = limbMesh(0.072, 0.058, 0.42, pantsMat)
    lower.position.y = -0.21
    kneePivot.add(lower)

    // Realistic Sneaker (Upper + Sole)
    const shoeGroup = new THREE.Group()
    shoeGroup.position.set(0, -0.44, 0.04)

    const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.22), shoeMat)
    shoeUpper.position.y = 0.03
    shoeUpper.castShadow = true
    shoeGroup.add(shoeUpper)

    const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.108, 0.03, 0.23), soleMat)
    shoeSole.position.y = -0.015
    shoeGroup.add(shoeSole)

    kneePivot.add(shoeGroup)

    character.add(hipPivot)
    return { hipPivot, kneePivot }
  }

  const armL = makeArm(-1)
  const armR = makeArm(1)
  const legL = makeLeg(-1)
  const legR = makeLeg(1)

  // Compact arm pose: keep elbows tucked in closer to body so they do not protrude into card space
  armL.shoulderPivot.rotation.set(-1.1, 0.15, 0.08)
  armL.elbowPivot.rotation.set(-1.1, 0, 0)
  armR.shoulderPivot.rotation.set(-1.1, -0.15, -0.08)
  armR.elbowPivot.rotation.set(-1.1, 0, 0)

  const contactGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.18 })
  )
  contactGlow.rotation.x = -Math.PI / 2
  contactGlow.position.y = 0.008
  character.add(contactGlow)

  // --- Laptop, held naturally between hands ---
  const laptopGroup = new THREE.Group()
  character.add(laptopGroup)
  laptopGroup.position.set(0, 1.02, 0.32)
  laptopGroup.rotation.set(-0.12, 0, 0)

  const laptopBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x94a3b8,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 0.6,
  })
  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.018, 0.24), laptopBodyMat)
  laptopBase.castShadow = true
  laptopGroup.add(laptopBase)

  const screenPivot = new THREE.Group()
  screenPivot.position.set(0, 0.01, -0.115)
  laptopGroup.add(screenPivot)
  const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.014), laptopBodyMat)
  laptopScreen.position.set(0, 0.1, -0.005)
  laptopScreen.rotation.x = -0.18
  screenPivot.add(laptopScreen)

  // Glowing screen portal
  const portalMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85, toneMapped: false })
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.185), portalMat)
  portal.position.set(0, 0.1, 0.003)
  portal.rotation.x = -0.18
  laptopScreen.add(portal)

  return { group: character, armL, armR, legL, legR, portal }
}

