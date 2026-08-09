import { installErrorOverlay, showError } from "./errorOverlay.js";
import { state, resetState } from "./state.js";
import { downloadSave, importSave } from "./save.js";
import { installInput } from "./input.js";
import { initRenderer, render } from "./renderer.js";
import { loadMap, update as updateMap, restorePlayerFromSave } from "./mapEngine.js";
import { installNpcInteraction } from "./npcEngine.js";
import { installBackpackUI, refreshBackpack } from "./inventory.js";
import { getActiveQuestSummaries, startQuest } from "./questEngine.js";
import { isBattleOpen } from "./battleEngine.js";
import { bus } from "./bus.js";
import { getItem } from "../items/index.js";
import "./dialogueEngine.js"; // ensure module side effects (none needed, kept for clarity)

installErrorOverlay();

function toast(text) {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.cssText = `position:fixed;left:50%;top:64px;transform:translateX(-50%);
    background:rgba(20,20,28,.92);border:1px solid rgba(255,255,255,.12);color:#fff;
    font-size:13px;padding:8px 14px;border-radius:10px;z-index:90;pointer-events:none;
    transition:opacity .4s;`;
  document.getElementById("app").appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; }, 1800);
  setTimeout(() => el.remove(), 2300);
}

function refreshHud() {
  document.getElementById("hudName").textContent = `${state.meta.playerName} · Lv${state.party[0]?.level ?? 1}`;
  document.getElementById("hudBlicks").textContent = `◆ ${state.wallet.blicks}`;
}

function renderQuestLog() {
  const list = document.getElementById("questList");
  list.innerHTML = "";
  const summaries = getActiveQuestSummaries();
  if (!summaries.length) {
    const empty = document.createElement("div");
    empty.style.cssText = "color:#777;font-size:13px;padding:20px 4px;text-align:center;";
    empty.textContent = "No active quests. Go talk to someone.";
    list.appendChild(empty);
    return;
  }
  for (const q of summaries) {
    const row = document.createElement("div");
    row.className = "row";
    row.style.flexDirection = "column"; row.style.alignItems = "stretch";
    row.innerHTML = `<div class="label">${q.name}</div><div class="sub">${q.stepDescription}</div>`;
    list.appendChild(row);
  }
}

function openSheet(id) { document.getElementById(id).classList.add("open"); }
function closeSheet(id) { document.getElementById(id).classList.remove("open"); }

function wireUi() {
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeSheet(btn.dataset.close));
  });
  document.getElementById("btnQuests").addEventListener("click", () => { renderQuestLog(); openSheet("questSheet"); });
  document.getElementById("btnBackpack").addEventListener("click", () => { refreshBackpack(); openSheet("backpackSheet"); });
  document.getElementById("btnSave").addEventListener("click", () => { downloadSave(); toast("Save file downloaded."); });

  document.getElementById("btnNewGame").addEventListener("click", () => {
    resetState();
    document.getElementById("titleScreen").style.display = "none";
    loadMap(state.player.mapId);
    refreshHud();
    toast("Welcome to Static Hollow.");
  });

  document.getElementById("btnLoadGame").addEventListener("click", () => {
    document.getElementById("fileImportInput").click();
  });
  document.getElementById("fileImportInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importSave(file);
      document.getElementById("titleScreen").style.display = "none";
      loadMap(state.player.mapId, undefined);
      restorePlayerFromSave();
      refreshHud();
      toast("Save file loaded.");
    } catch (err) { /* errorOverlay already shown by save.js */ }
  });

  bus.on("item:pickup", ({ item }) => { toast(`Picked up ${item.name}.`); refreshHud(); });
  bus.on("quest:started", ({ questId }) => toast(`Quest started: new objective in your log.`));
  bus.on("quest:completed", ({ questId }) => toast(`Quest complete!`));
  bus.on("field:effect", (eff) => toast(`Signal Flare lights the way for ${eff.durationSec}s.`));
  bus.on("dialogue:action", (action) => { if (action.type === "startQuest") startQuest(action.questId); });
  bus.on("battle:end", () => refreshHud());
  bus.on("state:replaced", () => refreshHud());
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  try {
    if (!isBattleOpen()) {
      updateMap(dt);
      render();
    }
  } catch (err) {
    showError("Game loop error", err.message);
  }
  requestAnimationFrame(loop);
}

function boot() {
  try {
    initRenderer();
    installInput(document.getElementById("app"));
    installNpcInteraction();
    installBackpackUI();
    wireUi();
    document.addEventListener("visibilitychange", () => { lastTime = performance.now(); });
    requestAnimationFrame((t) => { lastTime = t; loop(t); });
  } catch (err) {
    showError("Boot failed", err.message + "\n" + (err.stack || ""));
  }
}

boot();
