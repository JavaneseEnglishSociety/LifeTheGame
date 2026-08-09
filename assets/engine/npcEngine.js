import { getNpc } from "../npcs/index.js";
import { getCurrentMap, getPlayer } from "./mapEngine.js";
import { state, ensureTrainerState } from "./state.js";
import { bus } from "./bus.js";
import { startDialogue, showLine } from "./dialogueEngine.js";
import { addItem } from "./inventory.js";
import { startBattle } from "./battleEngine.js";
import { TILE_SIZE } from "../data/constants.js";

export function getNpcInstances() {
  const map = getCurrentMap();
  if (!map) return [];
  return map.npcSpawns.map(spawn => ({ npc: getNpc(spawn.npcId), x: spawn.x, y: spawn.y, facing: spawn.facing || "down" }));
}

function findNearbyNpc() {
  const player = getPlayer();
  const ptx = player.x / TILE_SIZE, pty = player.y / TILE_SIZE;
  let best = null, bestDist = Infinity;
  for (const inst of getNpcInstances()) {
    const cx = inst.x + 0.5, cy = inst.y + 0.5;
    const d = Math.hypot(cx - ptx, cy - pty);
    const radius = (inst.npc.interactionRadius ?? 1) + 0.5;
    if (d <= radius && d < bestDist) { best = inst; bestDist = d; }
  }
  return best;
}

// ------------------------------------------------------------------
// Trainer battle logic (opt-in — only fires for NPCs with a `trainer`
// block; dialogue-only NPCs are completely unaffected).
// ------------------------------------------------------------------
function hoursSince(ts) { return ts ? (Date.now() - ts) / 3.6e6 : Infinity; }

function offerTrainerInteraction(npc) {
  const t = npc.trainer;
  const ts = ensureTrainerState(npc.id);
  const d = t.dialogueBattle;

  if (!ts.defeated) {
    startDialogue(npc.name, {
      start: "n", nodes: { n: { text: d.preBattle, choices: [
        { label: "Battle!", next: null, action: { type: "startTrainerBattle", npcId: npc.id } },
        { label: "Not now.", next: null }
      ] } }
    });
    return;
  }
  if (!t.rechallengeable) {
    startDialogue(npc.name, { start: "n", nodes: { n: { text: d.alreadyDefeated, choices: [{ label: "Okay", next: null }] } } });
    return;
  }
  const ready = t.rechallengeCooldownHours == null || hoursSince(ts.lastBattleAt) >= t.rechallengeCooldownHours;
  if (ready) {
    startDialogue(npc.name, {
      start: "n", nodes: { n: { text: d.rechallengeOffer, choices: [
        { label: "Battle!", next: null, action: { type: "startTrainerBattle", npcId: npc.id } },
        { label: "Not now.", next: null }
      ] } }
    });
  } else {
    startDialogue(npc.name, { start: "n", nodes: { n: { text: d.onCooldown || "Not yet — give me a moment.", choices: [{ label: "Okay", next: null }] } } });
  }
}

bus.on("dialogue:action", (action) => {
  if (action.type === "startTrainerBattle") {
    const npc = getNpc(action.npcId);
    const t = npc.trainer;
    startBattle({ kind: "trainer", team: t.team, aiTier: t.aiTier, npcId: npc.id });
  }
});

bus.on("battle:end", (detail) => {
  if (detail.opponentKind !== "trainer" || !detail.npcId) return;
  const npc = getNpc(detail.npcId);
  const t = npc.trainer, d = t.dialogueBattle;
  const ts = ensureTrainerState(npc.id);

  if (detail.result === "victory") {
    const blicks = t.rewards.blicks.min + Math.floor(Math.random() * (t.rewards.blicks.max - t.rewards.blicks.min + 1));
    state.wallet.blicks += blicks;
    for (const it of t.rewards.guaranteedItems || []) addItem(it.itemId, it.count);
    for (const it of t.rewards.possibleItems || []) if (Math.random() < it.chance) addItem(it.itemId, it.count);
    ts.defeated = true; ts.timesDefeated += 1; ts.lastBattleAt = Date.now();
    showLine(npc.name, `${d.victory}  (+${blicks} Blicks)`);
  } else if (detail.result === "defeat") {
    showLine(npc.name, d.defeat || "...");
  }
});

// ------------------------------------------------------------------
export function installNpcInteraction() {
  document.getElementById("btnInteract").addEventListener("click", () => {
    const near = findNearbyNpc();
    if (!near) return;
    bus.emit("npc:talked", { npcId: near.npc.id });
    if (near.npc.trainer) offerTrainerInteraction(near.npc);
    else startDialogue(near.npc.name, near.npc.dialogue);
  });
}
