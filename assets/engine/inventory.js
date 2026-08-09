import { getItem } from "../items/index.js";
import { getCreature } from "../creatures/index.js";
import { state } from "./state.js";
import { bus } from "./bus.js";

export function addItem(itemId, count = 1) {
  const item = getItem(itemId);
  if (!item) return;
  if (item.category === "key") {
    if (!state.inventory.keyItems.includes(itemId)) state.inventory.keyItems.push(itemId);
    bus.emit("inventory:changed", null);
    return;
  }
  const cur = state.inventory.items[itemId] || 0;
  state.inventory.items[itemId] = Math.min(item.maxStack ?? 99, cur + count);
  bus.emit("inventory:changed", null);
}

export function removeItem(itemId, count = 1) {
  const cur = state.inventory.items[itemId] || 0;
  state.inventory.items[itemId] = Math.max(0, cur - count);
  bus.emit("inventory:changed", null);
}

export function useItem(itemId) {
  const item = getItem(itemId);
  if (!item || !item.onUse) return;
  if ((state.inventory.items[itemId] || 0) <= 0) return;
  if (item.onUse.type === "heal") {
    const target = state.party.find(p => (p.currentHp ?? 999) > 0) || state.party[0];
    if (target) {
      const species = getCreature(target.speciesId);
      const maxHp = species ? Math.round(species.baseStats.hp * (1 + (target.level - 1) * 0.14)) + target.level * 2 : 999;
      target.currentHp = Math.min(maxHp, (target.currentHp ?? maxHp) + item.onUse.amount);
    }
  }
  if (item.onUse.type === "field_effect") {
    bus.emit("field:effect", item.onUse);
  }
  removeItem(itemId, 1);
}

// ---------------------------------------------------------------
// Backpack UI — built entirely with DOM elements and CSS, no image
// files or canvas sprites of any kind.
// ---------------------------------------------------------------
function colorDot(color, glyph) {
  const d = document.createElement("div");
  d.className = "ico";
  d.style.borderRadius = "10px";
  d.style.background = "rgba(255,255,255,.06)";
  d.style.border = `1px solid ${color}`;
  d.style.display = "flex"; d.style.alignItems = "center"; d.style.justifyContent = "center";
  d.style.color = color; d.style.fontWeight = "800"; d.style.fontSize = "16px";
  d.textContent = glyph;
  return d;
}

function renderItemsPane() {
  const pane = document.getElementById("itemsPane");
  pane.innerHTML = "";
  const header = document.createElement("div");
  header.style.cssText = "color:#2fe4ff;font-weight:800;font-size:13px;margin:4px 0 8px;";
  header.textContent = `◆ ${state.wallet.blicks} Blicks`;
  pane.appendChild(header);

  const entries = Object.entries(state.inventory.items).filter(([, c]) => c > 0);
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.style.cssText = "color:#777;font-size:13px;padding:20px 4px;text-align:center;";
    empty.textContent = "No items yet.";
    pane.appendChild(empty);
  }
  for (const [itemId, count] of entries) {
    const item = getItem(itemId);
    if (!item) continue;
    const row = document.createElement("div");
    row.className = "row";
    row.appendChild(colorDot(item.sprite.color, item.sprite.glyph));
    const label = document.createElement("div");
    label.className = "label";
    label.innerHTML = `${item.name} <span class="sub">x${count}</span><div class="sub">${item.description}</div>`;
    row.appendChild(label);
    if (item.onUse) {
      const btn = document.createElement("button");
      btn.textContent = "Use";
      btn.onclick = () => { useItem(itemId); renderItemsPane(); };
      row.appendChild(btn);
    }
    pane.appendChild(row);
  }
  if (state.inventory.keyItems.length) {
    const kh = document.createElement("div");
    kh.style.cssText = "color:#ffcf5c;font-weight:800;font-size:12px;margin:14px 0 4px;";
    kh.textContent = "KEY ITEMS";
    pane.appendChild(kh);
    for (const itemId of state.inventory.keyItems) {
      const item = getItem(itemId) || { name: itemId, description: "", sprite: { color: "#ffcf5c", glyph: "★" } };
      const row = document.createElement("div");
      row.className = "row";
      row.appendChild(colorDot(item.sprite.color, item.sprite.glyph));
      const label = document.createElement("div");
      label.className = "label";
      label.innerHTML = `${item.name}<div class="sub">${item.description}</div>`;
      row.appendChild(label);
      pane.appendChild(row);
    }
  }
}

function renderPartyPane() {
  const pane = document.getElementById("partyPane");
  pane.innerHTML = "";
  for (const p of state.party) {
    const species = getCreature(p.speciesId);
    const maxHp = Math.round(species.baseStats.hp * (1 + (p.level - 1) * 0.14)) + p.level * 2;
    const hp = p.currentHp == null ? maxHp : p.currentHp;
    const row = document.createElement("div");
    row.className = "row";
    row.style.flexDirection = "column"; row.style.alignItems = "stretch";
    const top = document.createElement("div");
    top.style.cssText = "display:flex;align-items:center;gap:10px;";
    top.appendChild(colorDot(species.sprite.accent || "#fff", species.name[0]));
    const label = document.createElement("div");
    label.className = "label";
    label.innerHTML = `${p.nickname || species.name} <span class="sub">Lv${p.level} · ${species.category}</span>`;
    top.appendChild(label);
    row.appendChild(top);
    const bar = document.createElement("div");
    bar.className = "statbar";
    const fill = document.createElement("div");
    fill.style.width = Math.round((hp / maxHp) * 100) + "%";
    fill.style.background = hp / maxHp > 0.5 ? "#33d17a" : hp / maxHp > 0.2 ? "#e8b93a" : "#e84a4a";
    bar.appendChild(fill);
    row.appendChild(bar);
    const hpLabel = document.createElement("div");
    hpLabel.className = "sub"; hpLabel.style.marginTop = "3px";
    hpLabel.textContent = `${hp} / ${maxHp} HP`;
    row.appendChild(hpLabel);
    pane.appendChild(row);
  }
}

export function installBackpackUI() {
  const tabItems = document.getElementById("tabItems");
  const tabParty = document.getElementById("tabParty");
  const itemsPane = document.getElementById("itemsPane");
  const partyPane = document.getElementById("partyPane");
  tabItems.onclick = () => { itemsPane.style.display = "block"; partyPane.style.display = "none"; renderItemsPane(); };
  tabParty.onclick = () => { itemsPane.style.display = "none"; partyPane.style.display = "block"; renderPartyPane(); };
  bus.on("inventory:changed", () => { if (itemsPane.style.display !== "none") renderItemsPane(); });
  renderItemsPane();
}

export function refreshBackpack() { renderItemsPane(); renderPartyPane(); }
