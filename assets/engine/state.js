import { SAVE_VERSION } from "../data/constants.js";
import { bus } from "./bus.js";

function defaultState() {
  return {
    saveVersion: SAVE_VERSION,
    savedAt: Date.now(),
    meta: { playerName: "Ren", playtimeSeconds: 0 },
    player: { mapId: "analog_outskirts", x: 5, y: 5, facing: "down", spawnPointId: null },
    world: { unlockedMaps: ["analog_outskirts", "relay_tunnel_01"], mapStates: {} },
    party: [
      { instanceId: "p1", speciesId: "tuner", nickname: null, level: 5, xp: 0, currentHp: null, moveIds: null, statusEffect: null }
    ],
    storageBox: [],
    inventory: { items: { static_shard: 0, signal_flare: 1, tuning_fork: 1 }, keyItems: [] },
    wallet: { blicks: 150 },
    quests: { active: {}, completed: [] },
    trainers: {},
    globalFlags: {}
  };
}

export const state = defaultState();

export function resetState() {
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, defaultState());
  bus.emit("state:reset", null);
}

export function replaceState(obj) {
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, obj);
  bus.emit("state:replaced", null);
}

export function ensureMapState(mapId) {
  if (!state.world.mapStates[mapId]) {
    state.world.mapStates[mapId] = { itemsTaken: [], npcFlags: {}, localFlags: {} };
  }
  return state.world.mapStates[mapId];
}

export function ensureTrainerState(npcId) {
  if (!state.trainers[npcId]) {
    state.trainers[npcId] = { defeated: false, timesDefeated: 0, lastBattleAt: null };
  }
  return state.trainers[npcId];
}
