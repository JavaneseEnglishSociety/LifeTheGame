import { getQuest } from "../quests/index.js";
import { state } from "./state.js";
import { bus } from "./bus.js";
import { addItem } from "./inventory.js";

function currentStep(questId) {
  const q = getQuest(questId);
  const active = state.quests.active[questId];
  if (!active) return null;
  return q.steps[active.stepIndex];
}

export function startQuest(questId) {
  if (state.quests.active[questId] || state.quests.completed.includes(questId)) return;
  state.quests.active[questId] = { stepIndex: 0, stepFlags: {} };
  bus.emit("quest:started", { questId });
  checkStepCompletion(questId);
}

function stepProgress(questId, step) {
  if (step.type === "collect") return Math.min(step.count, state.inventory.items[step.target] || 0);
  return null;
}

function isStepDone(questId, step) {
  if (step.type === "collect") return (state.inventory.items[step.target] || 0) >= step.count;
  if (step.type === "talk") return !!state.quests.active[questId]?.stepFlags[`talked_${step.target}`];
  if (step.type === "defeat") return !!state.quests.active[questId]?.stepFlags[`defeated_${step.target}`];
  if (step.type === "reach") return !!state.quests.active[questId]?.stepFlags[`reached_${step.target}`];
  return false;
}

function checkStepCompletion(questId) {
  const active = state.quests.active[questId];
  if (!active) return;
  const q = getQuest(questId);
  const step = q.steps[active.stepIndex];
  if (!step) return;
  if (!isStepDone(questId, step)) return;
  active.stepIndex++;
  if (active.stepIndex >= q.steps.length) {
    completeQuest(questId);
  } else {
    bus.emit("quest:step", { questId, stepIndex: active.stepIndex });
    checkStepCompletion(questId);
  }
}

function completeQuest(questId) {
  const q = getQuest(questId);
  delete state.quests.active[questId];
  state.quests.completed.push(questId);
  const c = q.onComplete || {};
  if (c.flags) Object.assign(state.globalFlags, c.flags);
  if (c.items) for (const [id, count] of Object.entries(c.items)) addItem(id, count);
  if (c.unlockMaps) for (const m of c.unlockMaps) if (!state.world.unlockedMaps.includes(m)) state.world.unlockedMaps.push(m);
  bus.emit("quest:completed", { questId });
}

export function getActiveQuestSummaries() {
  return Object.keys(state.quests.active).map(questId => {
    const q = getQuest(questId);
    const active = state.quests.active[questId];
    const step = q.steps[active.stepIndex];
    const progress = stepProgress(questId, step);
    const desc = step.description.replace("{progress}", progress ?? "");
    return { questId, name: q.name, stepDescription: desc };
  });
}

// ---- generic listeners: quest steps never hardcode which quest cares ----
bus.on("item:pickup", () => {
  for (const questId of Object.keys(state.quests.active)) checkStepCompletion(questId);
});
bus.on("npc:talked", ({ npcId }) => {
  for (const questId of Object.keys(state.quests.active)) {
    const active = state.quests.active[questId];
    active.stepFlags[`talked_${npcId}`] = true;
    checkStepCompletion(questId);
  }
});
bus.on("battle:end", ({ result, defeatedSpeciesId, npcId }) => {
  if (result !== "victory") return;
  const targets = [defeatedSpeciesId, npcId].filter(Boolean);
  for (const questId of Object.keys(state.quests.active)) {
    const active = state.quests.active[questId];
    for (const t of targets) active.stepFlags[`defeated_${t}`] = true;
    checkStepCompletion(questId);
  }
});
bus.on("map:loaded", ({ mapId }) => {
  for (const questId of Object.keys(state.quests.active)) {
    const active = state.quests.active[questId];
    active.stepFlags[`reached_${mapId}`] = true;
    checkStepCompletion(questId);
  }
});
