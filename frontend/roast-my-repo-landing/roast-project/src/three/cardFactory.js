import * as THREE from 'three'

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Builds a THREE.Mesh whose texture is drawn with 2D canvas — used for every
 * floating "card" in the scene (profile card, repo cards, scan readout,
 * roast card). Returns the mesh plus a `redraw(...)` you can call any time
 * (e.g. from the scroll timeline) to update its contents.
 */
export function makeCardMesh(w, h, texW, texH, drawFn) {
  const canvas = document.createElement('canvas')
  canvas.width = texW
  canvas.height = texH
  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  const redraw = (...args) => {
    drawFn(ctx, texW, texH, ...args)
    texture.needsUpdate = true
  }
  redraw()

  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
  return { mesh, redraw }
}
