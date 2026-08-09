import { getCurrentMap, getPlayer } from "./mapEngine.js";
import { getSprite } from "./sprites.js";
import { TILE_SIZE, ERA_TINTS } from "../data/constants.js";
import { ensureMapState } from "./state.js";
import { getNpcInstances } from "./npcEngine.js";

let canvas, ctx;
const TILE_COLORS = {
  0: { base: "#3a6b3f", edge: "#2c522f" }, // grass
  1: { base: "#a08a5a", edge: "#7d6a44" }, // path
  2: { base: "#2a2a34", edge: "#1a1a22" }, // wall
  3: { base: "#2a4a6a", edge: "#1c3550" }, // water
  4: { base: "#3a3a46", edge: "#26262e" }  // tunnel floor
};

export function initRenderer() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function render() {
  const map = getCurrentMap();
  if (!map || !canvas) return;
  const vw = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
  const vh = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
  const player = getPlayer();

  const mapPxW = map.width * TILE_SIZE, mapPxH = map.height * TILE_SIZE;
  let camX = player.x - vw / 2, camY = player.y - vh / 2;
  camX = Math.max(0, Math.min(camX, Math.max(0, mapPxW - vw)));
  camY = Math.max(0, Math.min(camY, Math.max(0, mapPxH - vh)));

  const tint = ERA_TINTS[map.era] || "#888";
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, vw, vh);

  const startX = Math.max(0, Math.floor(camX / TILE_SIZE));
  const startY = Math.max(0, Math.floor(camY / TILE_SIZE));
  const endX = Math.min(map.width, Math.ceil((camX + vw) / TILE_SIZE) + 1);
  const endY = Math.min(map.height, Math.ceil((camY + vh) / TILE_SIZE) + 1);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const id = map.tiles[y][x];
      const spr = getSprite("tile", TILE_SIZE, TILE_SIZE, TILE_COLORS[id] || TILE_COLORS[0]);
      ctx.drawImage(spr, x * TILE_SIZE - camX, y * TILE_SIZE - camY);
    }
  }

  // item pickups still on the ground
  const mapState = ensureMapState(map.id);
  for (const spawn of map.itemSpawns) {
    if (mapState.itemsTaken.includes(spawn.uniqueId)) continue;
    const sx = spawn.x * TILE_SIZE - camX, sy = spawn.y * TILE_SIZE - camY;
    if (sx < -TILE_SIZE || sy < -TILE_SIZE || sx > vw || sy > vh) continue;
    const icon = getSprite("item", 22, 22, { color: tint, glyph: "◆" });
    ctx.drawImage(icon, sx + TILE_SIZE / 2 - 11, sy + TILE_SIZE / 2 - 11);
  }

  // NPCs
  for (const inst of getNpcInstances()) {
    const sx = inst.x * TILE_SIZE - camX + TILE_SIZE / 2, sy = inst.y * TILE_SIZE - camY + TILE_SIZE / 2;
    if (sx < -TILE_SIZE || sy < -TILE_SIZE || sx > vw + TILE_SIZE || sy > vh + TILE_SIZE) continue;
    const spr = getSprite("person", 28, 34, { ...inst.npc.sprite, dir: inst.facing || "down" });
    ctx.drawImage(spr, sx - 14, sy - 22);
  }

  // Player (bob offset for a light walk animation)
  const bob = player.moving ? (player.walkFrame === 0 ? -1 : 1) : 0;
  const pSpr = getSprite("person", 30, 36, { skin: "#e8b98a", hair: "#7a4a2b", top: "#3a5f7d", accent: "#ffcf5c", dir: player.facing, bob });
  ctx.drawImage(pSpr, player.x - camX - 15, player.y - camY - 24);
}
