import { getMap, ENCOUNTER_TABLES } from "../maps/index.js";
import { state, ensureMapState } from "./state.js";
import { getInput } from "./input.js";
import { bus } from "./bus.js";
import { TILE_SIZE } from "../data/constants.js";
import { getItem } from "../items/index.js";

const PLAYER_SPEED = 130; // px/sec
const PLAYER_W = 20, PLAYER_H = 12; // feet hitbox

let currentMap = null;
let player = { x: 0, y: 0, facing: "down", moving: false, animTimer: 0, walkFrame: 0 };
let lastTile = { x: -1, y: -1 };
export let locked = false; // true during battle/dialogue/transition — movement paused
export function setLocked(v) { locked = v; }

export function getPlayer() { return player; }
export function getCurrentMap() { return currentMap; }

function tileBlocked(map, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return true;
  return map.collision[ty][tx] === 1;
}

function rectInsideZone(px, py, zone) {
  const tx = Math.floor(px / TILE_SIZE), ty = Math.floor(py / TILE_SIZE);
  return tx >= zone.x && tx < zone.x + zone.w && ty >= zone.y && ty < zone.y + zone.h;
}

export function loadMap(mapId, spawnId = "default") {
  const map = getMap(mapId);
  if (!map) throw new Error(`Unknown map: ${mapId}`);
  currentMap = map;
  ensureMapState(mapId);
  const sp = map.spawnPoints[spawnId] || map.spawnPoints.default;
  player.x = sp.x * TILE_SIZE + TILE_SIZE / 2;
  player.y = sp.y * TILE_SIZE + TILE_SIZE / 2;
  state.player.mapId = mapId;
  state.player.x = player.x; state.player.y = player.y; state.player.spawnPointId = null;
  lastTile = { x: -1, y: -1 };
  bus.emit("map:loaded", { mapId });
}

export function restorePlayerFromSave() {
  player.x = state.player.x; player.y = state.player.y; player.facing = state.player.facing || "down";
}

function tryMove(dx, dy) {
  const map = currentMap;
  const corners = (nx, ny) => [
    [nx - PLAYER_W / 2, ny - PLAYER_H / 2], [nx + PLAYER_W / 2, ny - PLAYER_H / 2],
    [nx - PLAYER_W / 2, ny + PLAYER_H / 2], [nx + PLAYER_W / 2, ny + PLAYER_H / 2]
  ];
  let nx = player.x + dx, ny = player.y;
  let blocked = corners(nx, ny).some(([cx, cy]) => tileBlocked(map, Math.floor(cx / TILE_SIZE), Math.floor(cy / TILE_SIZE)));
  if (!blocked) player.x = nx;
  nx = player.x; ny = player.y + dy;
  blocked = corners(nx, ny).some(([cx, cy]) => tileBlocked(map, Math.floor(cx / TILE_SIZE), Math.floor(cy / TILE_SIZE)));
  if (!blocked) player.y = ny;
}

function checkConnectors() {
  const tx = Math.floor(player.x / TILE_SIZE), ty = Math.floor(player.y / TILE_SIZE);
  for (const c of currentMap.connectors) {
    const hit = tx >= c.x && tx < c.x + c.w && ty >= c.y && ty < c.y + c.h;
    if (!hit) continue;
    if (c.requiresFlag && !state.globalFlags[c.requiresFlag]) continue;
    setLocked(true);
    bus.emit("map:transition", { fx: c.transitionFx });
    setTimeout(() => {
      loadMap(c.targetMapId, c.targetSpawnId);
      setLocked(false);
    }, 260);
    return;
  }
}

function checkItems() {
  const mapState = ensureMapState(currentMap.id);
  const tx = Math.floor(player.x / TILE_SIZE), ty = Math.floor(player.y / TILE_SIZE);
  for (const spawn of currentMap.itemSpawns) {
    if (mapState.itemsTaken.includes(spawn.uniqueId)) continue;
    if (spawn.x === tx && spawn.y === ty) {
      mapState.itemsTaken.push(spawn.uniqueId);
      const item = getItem(spawn.itemId);
      bus.emit("item:pickup", { itemId: spawn.itemId, item });
    }
  }
}

function checkEncounters() {
  const tx = Math.floor(player.x / TILE_SIZE), ty = Math.floor(player.y / TILE_SIZE);
  if (tx === lastTile.x && ty === lastTile.y) return;
  lastTile = { x: tx, y: ty };
  for (const zone of currentMap.encounterZones) {
    if (!rectInsideZone(player.x, player.y, zone)) continue;
    if (Math.random() < 0.12) {
      const table = ENCOUNTER_TABLES[zone.tableId] || [];
      bus.emit("encounter:wild", { table });
    }
    break;
  }
}

export function update(dt) {
  if (!currentMap) return;
  if (locked) { player.moving = false; return; }
  const inp = getInput();
  let moved = false;
  if (inp.moveX !== 0 || inp.moveY !== 0) {
    tryMove(inp.moveX * PLAYER_SPEED * dt, inp.moveY * PLAYER_SPEED * dt);
    moved = true;
    player.facing = Math.abs(inp.moveX) > Math.abs(inp.moveY)
      ? (inp.moveX > 0 ? "right" : "left")
      : (inp.moveY > 0 ? "down" : "up");
  }
  player.moving = moved;
  player.animTimer += dt;
  if (player.animTimer > 0.18) { player.animTimer = 0; player.walkFrame = 1 - player.walkFrame; }

  state.player.x = player.x; state.player.y = player.y; state.player.facing = player.facing;

  if (moved) { checkConnectors(); checkItems(); checkEncounters(); }
}
