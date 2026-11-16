// Guards 3D clicks so that dragging the camera never triggers an object click.
const drag = { moved: 0, downAt: 0, active: false }

export const pointerState = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  down: false,
}

export function markDragStart() {
  drag.moved = 0
  drag.downAt = performance.now()
  drag.active = true
}

export function markDragMove(dist) {
  drag.moved = Math.max(drag.moved, dist)
}

export function markDragEnd() {
  setTimeout(() => {
    drag.active = false
    drag.moved = 0
  }, 80)
}

export function clickBlocked() {
  return drag.moved > 9 || !drag.active
}

export function setCursor(pointer) {
  document.body.style.cursor = pointer ? 'pointer' : ''
}
