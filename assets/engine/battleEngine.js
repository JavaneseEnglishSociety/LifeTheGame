import { getCreature } from "../creatures/index.js";
import { getMove } from "../data/moves.js";
import { state } from "./state.js";
import { bus } from "./bus.js";
import { getSprite } from "./sprites.js";
import { setLocked } from "./mapEngine.js";

let battle = null; // active battle state
let battleCanvas, battleCtx;

function scaleStat(base, level) { return Math.max(1, Math.round(base * (1 + (level - 1) * 0.09))); }
function scaleHp(base, level) { return Math.round(base * (1 + (level - 1) * 0.14)) + level * 2; }

function pickMoves(species, level, moveIds) {
  if (moveIds) return moveIds.map(getMove).filter(Boolean);
  const unlocked = species.movePool.filter(m => m.level <= level).map(m => m.moveId);
  const uniq = [...new Set(unlocked)].slice(-4);
  return uniq.map(getMove).filter(Boolean);
}

function makeBattler({ speciesId, level, moveIds = null, currentHp = null, nickname = null, instanceId = null }) {
  const species = getCreature(speciesId);
  const stats = {
    atk: scaleStat(species.baseStats.atk, level), def: scaleStat(species.baseStats.def, level),
    spa: scaleStat(species.baseStats.spa, level), spd: scaleStat(species.baseStats.spd, level),
    spe: scaleStat(species.baseStats.spe, level), acc: species.baseStats.acc, luk: species.baseStats.luk
  };
  const maxHp = scaleHp(species.baseStats.hp, level);
  return {
    instanceId, speciesId, species, name: nickname || species.name, level,
    maxHp, currentHp: currentHp == null ? maxHp : Math.min(currentHp, maxHp),
    stats, moves: pickMoves(species, level, moveIds), statusEffect: null, fainted: false
  };
}

function buildPlayerTeam() {
  return state.party.map(p => makeBattler({
    speciesId: p.speciesId, level: p.level, moveIds: p.moveIds,
    currentHp: p.currentHp, instanceId: p.instanceId
  }));
}

function syncPartyHp() {
  for (const b of battle.playerTeam) {
    const p = state.party.find(x => x.instanceId === b.instanceId);
    if (p) p.currentHp = b.currentHp;
  }
}

function log(text) { document.getElementById("battleLog").textContent = text; }

function accuracyRoll(move, attacker, defender) {
  const acc = (move.accuracy ?? 100) * (attacker.stats.acc / 90);
  return Math.random() * 100 < acc;
}
function critRoll(luk) { return Math.random() < 0.04 + luk / 800; }

function applyDamage(move, attacker, defender) {
  if (move.power <= 0) return { dmg: 0, crit: false, missed: false };
  if (!accuracyRoll(move, attacker, defender)) return { dmg: 0, crit: false, missed: true };
  const atk = move.category === "special" ? attacker.stats.spa : attacker.stats.atk;
  const def = move.category === "special" ? defender.stats.spd : defender.stats.def;
  const crit = critRoll(attacker.stats.luk);
  let dmg = Math.max(1, Math.round(((2 * attacker.level / 5 + 2) * move.power * (atk / Math.max(1, def))) / 50 + 2));
  dmg = Math.round(dmg * (0.85 + Math.random() * 0.3) * (crit ? 1.6 : 1));
  defender.currentHp = Math.max(0, defender.currentHp - dmg);
  if (defender.currentHp === 0) defender.fainted = true;
  return { dmg, crit, missed: false };
}

function applyStatusEffect(move, attacker, defender) {
  const eff = move.effect;
  if (!eff) return;
  if (eff.status && Math.random() < (eff.chance ?? 1)) defender.statusEffect = eff.status;
  if (eff.statChange) { for (const k in eff.statChange) (eff.self ? attacker : defender).stats[k] = Math.max(1, Math.round((eff.self ? attacker : defender).stats[k] * (1 + eff.statChange[k] * 0.25))); }
  if (eff.heal) { const t = eff.self ? attacker : defender; t.currentHp = Math.min(t.maxHp, t.currentHp + Math.round(t.maxHp * eff.heal)); }
}

function statusBlocksTurn(battler) {
  if (battler.statusEffect === "jammed" && Math.random() < 0.35) return true;
  return false;
}

function opponentAI() {
  const active = battle.opponentActive();
  const usable = active.moves.filter(m => m);
  if (!usable.length) return null;
  if (battle.aiTier === "tactical") {
    return usable.reduce((best, m) => (m.power > (best?.power ?? -1) ? m : best), null);
  }
  return usable[Math.floor(Math.random() * usable.length)];
}

function renderBattle() {
  if (!battleCanvas) return;
  const w = battleCanvas.width = battleCanvas.clientWidth;
  const h = battleCanvas.height = battleCanvas.clientHeight;
  battleCtx.clearRect(0, 0, w, h);
  const grad = battleCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#1a1a28"); grad.addColorStop(1, "#0a0a12");
  battleCtx.fillStyle = grad; battleCtx.fillRect(0, 0, w, h);

  const opp = battle.opponentActive();
  const plr = battle.playerActive();
  drawCombatant(opp, w * 0.72, h * 0.32, true);
  drawCombatant(plr, w * 0.28, h * 0.68, false);
}

function drawCombatant(battler, cx, cy, isOpponent) {
  const spr = getSprite(battler.species.sprite.kind, 110, 110, battler.species.sprite);
  battleCtx.drawImage(spr, cx - 55, cy - 55);
  const barW = 130;
  battleCtx.fillStyle = "#000a"; battleCtx.fillRect(cx - barW / 2, cy - 78, barW, 30);
  battleCtx.fillStyle = "#fff"; battleCtx.font = "bold 12px sans-serif";
  battleCtx.fillText(`${battler.name}  Lv${battler.level}`, cx - barW / 2 + 6, cy - 64);
  const pct = Math.max(0, battler.currentHp / battler.maxHp);
  battleCtx.fillStyle = "#222"; battleCtx.fillRect(cx - barW / 2 + 6, cy - 58, barW - 12, 6);
  battleCtx.fillStyle = pct > 0.5 ? "#33d17a" : pct > 0.2 ? "#e8b93a" : "#e84a4a";
  battleCtx.fillRect(cx - barW / 2 + 6, cy - 58, (barW - 12) * pct, 6);
}

function renderMoveButtons() {
  const grid = document.getElementById("moveGrid");
  const switchGrid = document.getElementById("battleSwitchGrid");
  grid.style.display = "grid"; switchGrid.style.display = "none";
  grid.innerHTML = "";
  const active = battle.playerActive();
  for (const move of active.moves) {
    const btn = document.createElement("button");
    btn.textContent = move.name;
    btn.onclick = () => playerAct(move);
    grid.appendChild(btn);
  }
}

function renderSwitchButtons(forced) {
  const grid = document.getElementById("moveGrid");
  const switchGrid = document.getElementById("battleSwitchGrid");
  grid.style.display = "none"; switchGrid.style.display = "grid";
  switchGrid.innerHTML = "";
  battle.playerTeam.forEach((b, i) => {
    if (b.fainted || i === battle.playerActiveIndex) return;
    const btn = document.createElement("button");
    btn.textContent = `${b.name} Lv${b.level} (${b.currentHp}/${b.maxHp})`;
    btn.onclick = () => { battle.playerActiveIndex = i; renderBattle(); renderMoveButtons(); log(`Go, ${b.name}!`); };
    switchGrid.appendChild(btn);
  });
  if (!forced) {
    const back = document.createElement("button");
    back.textContent = "← Back";
    back.onclick = () => renderMoveButtons();
    switchGrid.appendChild(back);
  }
}

function endBattle(result) {
  syncPartyHp();
  document.getElementById("battleScreen").classList.remove("open");
  setLocked(false);
  const detail = {
    result, opponentKind: battle.kind, npcId: battle.npcId || null,
    defeatedSpeciesId: battle.kind === "wild" ? battle.opponentTeam[0].speciesId : null
  };
  battle = null;
  bus.emit("battle:end", detail);
}

// Checks BOTH sides for a faint every time — an opponent's non-final team
// member fainting must never mask the player's own Glyph also having fainted
// on the same turn (a real bug if only one side is checked per call).
function checkFaintsAndContinue() {
  const opp = battle.opponentActive();
  const messages = [];

  if (opp.fainted) {
    if (battle.kind === "trainer" && battle.opponentActiveIndex < battle.opponentTeam.length - 1) {
      battle.opponentActiveIndex++;
      messages.push(`They send out ${battle.opponentActive().name}!`);
    } else {
      log(`${opp.name} fainted! You won!`);
      renderBattle();
      setTimeout(() => endBattle("victory"), 900);
      return false;
    }
  }

  const plr = battle.playerActive();
  if (plr.fainted) {
    const anyLeft = battle.playerTeam.some(b => !b.fainted);
    if (anyLeft) {
      log([...messages, `${plr.name} fainted! Choose your next Glyph.`].join("  "));
      renderBattle();
      renderSwitchButtons(true);
      return false; // switch grid is already shown, don't also render move buttons
    }
    log([...messages, `${plr.name} fainted! You have no Glyphs left...`].join("  "));
    renderBattle();
    setTimeout(() => endBattle("defeat"), 900);
    return false;
  }

  if (messages.length) log(messages.join("  "));
  renderBattle();
  return true;
}

function resolveTurn(playerMove) {
  const plr = battle.playerActive(), opp = battle.opponentActive();
  const oppMove = opponentAI();
  const first = plr.stats.spe + plr.stats.luk / 20 >= opp.stats.spe + opp.stats.luk / 20 ? "player" : "opponent";
  const order = first === "player" ? [["player", plr, opp, playerMove], ["opponent", opp, plr, oppMove]]
                                    : [["opponent", opp, plr, oppMove], ["player", plr, opp, playerMove]];
  let lines = [];
  for (const [side, atk, def, move] of order) {
    if (!move) continue;
    if (atk.fainted || def.fainted) continue;
    if (statusBlocksTurn(atk)) { lines.push(`${atk.name} is jammed and can't move!`); continue; }
    const res = applyDamage(move, atk, def);
    if (res.missed) lines.push(`${atk.name}'s ${move.name} missed!`);
    else if (res.dmg > 0) lines.push(`${atk.name} used ${move.name}!${res.crit ? " Critical hit!" : ""} (${res.dmg} dmg)`);
    else { lines.push(`${atk.name} used ${move.name}.`); applyStatusEffect(move, atk, def); }
    if (res.dmg > 0) applyStatusEffect(move, atk, def);
  }
  log(lines.join("  "));
  renderBattle();
  const cont = checkFaintsAndContinue();
  if (cont) renderMoveButtons();
}

function playerAct(move) { resolveTurn(move); }

/**
 * opponent: { kind:'wild', creature:{speciesId,level} } OR
 *           { kind:'trainer', team:[{speciesId,level,moveIds}], aiTier, npcId }
 */
export function startBattle(opponent) {
  const playerTeam = buildPlayerTeam();
  const opponentTeam = opponent.kind === "wild"
    ? [makeBattler(opponent.creature)]
    : opponent.team.map(makeBattler);

  battle = {
    kind: opponent.kind,
    aiTier: opponent.aiTier || "basic",
    npcId: opponent.npcId || null,
    playerTeam, playerActiveIndex: playerTeam.findIndex(b => !b.fainted && b.currentHp > 0) === -1 ? 0 : playerTeam.findIndex(b => b.currentHp > 0),
    opponentTeam, opponentActiveIndex: 0,
    playerActive() { return this.playerTeam[this.playerActiveIndex]; },
    opponentActive() { return this.opponentTeam[this.opponentActiveIndex]; }
  };

  battleCanvas = document.getElementById("battleCanvas");
  battleCtx = battleCanvas.getContext("2d");
  document.getElementById("battleScreen").classList.add("open");
  setLocked(true);
  log(opponent.kind === "wild" ? "A wild Glyph appeared!" : "Battle start!");
  renderBattle();
  renderMoveButtons();
}

bus.on("encounter:wild", ({ table }) => {
  if (!table.length) return;
  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  const pick = table.find(t => (r -= t.weight) <= 0) || table[0];
  const level = pick.levelRange[0] + Math.floor(Math.random() * (pick.levelRange[1] - pick.levelRange[0] + 1));
  startBattle({ kind: "wild", creature: { speciesId: pick.speciesId, level } });
});

export function isBattleOpen() { return !!battle; }
