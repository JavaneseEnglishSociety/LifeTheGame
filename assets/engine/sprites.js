// Procedurally generated sprites. Nothing here is a downloaded/external asset —
// every sprite is drawn onto an offscreen canvas from a small color/shape
// descriptor and cached. This is what the game actually renders.

const cache = new Map();

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---- top-down person (player or NPC) ----
function drawPersonTop(ctx, w, h, { skin = "#e8b98a", hair = "#5a3a24", top = "#3a5f7d", accent = "#ffcf5c", dir = "down", bob = 0 }) {
  const cx = w / 2, cy = h / 2 + bob;
  ctx.save();
  ctx.translate(cx, cy);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.32, w * 0.22, h * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  // body (jacket)
  ctx.fillStyle = top;
  roundRect(ctx, -w * 0.22, -h * 0.06, w * 0.44, h * 0.34, 6);
  ctx.fill();
  // accent stripe (satchel strap)
  ctx.strokeStyle = accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-w * 0.2, -h * 0.05); ctx.lineTo(w * 0.15, h * 0.25); ctx.stroke();
  // head
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, -h * 0.22, w * 0.2, 0, Math.PI * 2); ctx.fill();
  // hair
  ctx.fillStyle = hair;
  ctx.beginPath();
  if (dir === "up") { ctx.arc(0, -h * 0.24, w * 0.2, Math.PI, Math.PI * 2); }
  else { ctx.arc(0, -h * 0.26, w * 0.21, Math.PI * 0.95, Math.PI * 2.05); }
  ctx.fill();
  // face direction hint
  if (dir !== "up") {
    ctx.fillStyle = "#2a2a2a";
    const fx = dir === "left" ? -w * 0.06 : dir === "right" ? w * 0.06 : 0;
    ctx.beginPath(); ctx.arc(fx - w * 0.05, -h * 0.22, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(fx + w * 0.05, -h * 0.22, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---- creature blob (Signal / Loop style) ----
function drawBlob(ctx, w, h, { base = "#caa24a", accent = "#ffcf5c", eye = "#2a1c00", spiky = false }) {
  const cx = w / 2, cy = h / 2;
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.3, w * 0.28, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = base;
  ctx.beginPath();
  if (spiky) {
    const spikes = 10, rOuter = w * 0.32, rInner = w * 0.24;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const a = (Math.PI * i) / spikes;
      const px = Math.cos(a) * r, py = Math.sin(a) * r * 0.85;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
  } else {
    ctx.ellipse(0, 0, w * 0.3, h * 0.26, 0, 0, Math.PI * 2);
  }
  ctx.closePath(); ctx.fill();
  // accent ring / dial
  ctx.strokeStyle = accent; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, -2, w * 0.14, 0, Math.PI * 2); ctx.stroke();
  // eye
  ctx.fillStyle = eye;
  ctx.beginPath(); ctx.arc(0, -2, w * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---- glitch shard (Corrupt style) ----
function drawShard(ctx, w, h, { base = "#1a1a22", accent = "#ff2fd0", accent2 = "#2fe4ff" }) {
  const cx = w / 2, cy = h / 2;
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath(); ctx.ellipse(0, h * 0.3, w * 0.26, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.32); ctx.lineTo(w * 0.26, -h * 0.02); ctx.lineTo(w * 0.16, h * 0.28);
  ctx.lineTo(-w * 0.16, h * 0.28); ctx.lineTo(-w * 0.26, -h * 0.02);
  ctx.closePath(); ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i % 2 === 0 ? accent : accent2;
    ctx.globalAlpha = 0.55;
    const off = (i - 1) * 6;
    ctx.fillRect(-w * 0.14 + off, -h * 0.05 + i * 6, w * 0.28, 2.5);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(0, -h * 0.02, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---- tile ----
function drawTile(ctx, w, h, { base, edge }) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = edge;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  ctx.globalAlpha = 1;
}

// ---- item icon ----
function drawItemIcon(ctx, w, h, { color = "#ffcf5c", glyph = "?" }) {
  ctx.save(); ctx.translate(w / 2, h / 2);
  ctx.fillStyle = "rgba(255,255,255,.06)";
  roundRect(ctx, -w * 0.4, -h * 0.4, w * 0.8, h * 0.8, 8); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  roundRect(ctx, -w * 0.4, -h * 0.4, w * 0.8, h * 0.8, 8); ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.floor(h * 0.4)}px monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(glyph, 0, 1);
  ctx.restore();
}

const DRAWERS = { person: drawPersonTop, blob: drawBlob, shard: drawShard, tile: drawTile, item: drawItemIcon };

/** get(kind, w, h, descriptor) -> cached HTMLCanvasElement, generated once. */
export function getSprite(kind, w, h, descriptor = {}) {
  const key = kind + "|" + w + "x" + h + "|" + JSON.stringify(descriptor);
  if (cache.has(key)) return cache.get(key);
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");
  (DRAWERS[kind] || drawBlob)(ctx, w, h, descriptor);
  cache.set(key, c);
  return c;
}
