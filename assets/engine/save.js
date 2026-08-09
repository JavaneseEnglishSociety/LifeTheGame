import { state, replaceState } from "./state.js";
import { SAVE_VERSION } from "../data/constants.js";
import { showError } from "./errorOverlay.js";
import { bus } from "./bus.js";

export function buildSaveFile() {
  return JSON.parse(JSON.stringify({ ...state, savedAt: Date.now() }));
}

export function downloadSave() {
  const data = buildSaveFile();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `static-save-${(state.meta.playerName || "player").replace(/\s+/g, "_")}-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const migrations = {
  "1.0.0": (old) => ({
    ...old,
    wallet: old.wallet || { blicks: 0 },
    trainers: old.trainers || {}
  })
};

function migrate(obj) {
  let cur = obj;
  if (cur.saveVersion === "1.0.0") cur = migrations["1.0.0"](cur);
  cur.saveVersion = SAVE_VERSION;
  return cur;
}

function validate(obj) {
  if (!obj || typeof obj !== "object") throw new Error("Save file is not a valid JSON object.");
  if (!obj.player || !obj.player.mapId) throw new Error("Save file is missing player/map data.");
  if (!obj.party || !Array.isArray(obj.party)) throw new Error("Save file is missing party data.");
  return true;
}

export function importSave(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let obj = JSON.parse(reader.result);
        if (obj.saveVersion !== SAVE_VERSION) obj = migrate(obj);
        validate(obj);
        replaceState(obj);
        bus.emit("save:imported", obj);
        resolve(obj);
      } catch (err) {
        showError("Could not load save file", err.message);
        reject(err);
      }
    };
    reader.onerror = () => {
      showError("Could not read save file", String(reader.error));
      reject(reader.error);
    };
    reader.readAsText(file);
  });
}
