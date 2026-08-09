// Unified input: keyboard + a floating multi-touch joystick.
const keys = new Set();
const pointers = new Map(); // pointerId -> {kind:'joy', originX, originY, x, y}
let joyVector = { x: 0, y: 0 };

const input = { moveX: 0, moveY: 0 };

function setJoyVisual(active, ox, oy, kx, ky) {
  const base = document.getElementById("joyBase");
  const knob = document.getElementById("joyKnob");
  if (!base) return;
  if (active) {
    base.style.display = "block";
    base.style.left = (ox - 45) + "px";
    base.style.top = (oy - 45) + "px";
    knob.style.left = (kx - ox + 45) + "px";
    knob.style.top = (ky - oy + 45) + "px";
  } else {
    base.style.display = "none";
  }
}

export function installInput(root) {
  window.addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
  window.addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

  const MAX_TRAVEL = 42;

  root.addEventListener("pointerdown", e => {
    // only the left ~55% of the screen activates the joystick; right side is reserved for buttons
    if (e.clientX > window.innerWidth * 0.55) return;
    if (e.target.closest(".sheet, #dialogueBox, #battleScreen, #hud, .roundBtn")) return;
    pointers.set(e.pointerId, { originX: e.clientX, originY: e.clientY, x: e.clientX, y: e.clientY });
    setJoyVisual(true, e.clientX, e.clientY, e.clientX, e.clientY);
    e.preventDefault();
  }, { passive: false });

  root.addEventListener("pointermove", e => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    let dx = e.clientX - p.originX, dy = e.clientY - p.originY;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_TRAVEL) { dx = (dx / dist) * MAX_TRAVEL; dy = (dy / dist) * MAX_TRAVEL; }
    p.x = p.originX + dx; p.y = p.originY + dy;
    joyVector = { x: dx / MAX_TRAVEL, y: dy / MAX_TRAVEL };
    setJoyVisual(true, p.originX, p.originY, p.x, p.y);
    e.preventDefault();
  }, { passive: false });

  function endPointer(e) {
    if (pointers.has(e.pointerId)) {
      pointers.delete(e.pointerId);
      joyVector = { x: 0, y: 0 };
      setJoyVisual(false);
    }
  }
  root.addEventListener("pointerup", endPointer);
  root.addEventListener("pointercancel", endPointer);

  document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
  document.addEventListener("gesturestart", e => e.preventDefault());
  document.addEventListener("dblclick", e => e.preventDefault());
  window.addEventListener("contextmenu", e => e.preventDefault());
}

export function getInput() {
  let mx = 0, my = 0;
  if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
  if (keys.has("d") || keys.has("arrowright")) mx += 1;
  if (keys.has("w") || keys.has("arrowup")) my -= 1;
  if (keys.has("s") || keys.has("arrowdown")) my += 1;
  if (mx === 0 && my === 0) {
    const dz = 0.18;
    mx = Math.abs(joyVector.x) > dz ? joyVector.x : 0;
    my = Math.abs(joyVector.y) > dz ? joyVector.y : 0;
  } else {
    const len = Math.hypot(mx, my) || 1;
    mx /= len; my /= len;
  }
  input.moveX = mx; input.moveY = my;
  return input;
}
