import { bus } from "./bus.js";
import { setLocked } from "./mapEngine.js";
import { state } from "./state.js";

let activeTree = null;
let activeNodeId = null;
let onEnd = null;

const box = () => document.getElementById("dialogueBox");
const speakerEl = () => document.getElementById("dialogueSpeaker");
const textEl = () => document.getElementById("dialogueText");
const choicesEl = () => document.getElementById("dialogueChoices");

export function isOpen() { return box()?.classList.contains("open"); }

export function startDialogue(speakerName, tree, endCallback = null) {
  activeTree = tree; activeNodeId = tree.start; onEnd = endCallback;
  speakerEl().textContent = speakerName;
  setLocked(true);
  box().classList.add("open");
  renderNode();
}

function runAction(action) {
  if (!action) return;
  bus.emit("dialogue:action", action);
  if (action.type === "setFlag") state.globalFlags[action.flag] = action.value ?? true;
}

function renderNode() {
  const node = activeTree.nodes[activeNodeId];
  textEl().textContent = node.text;
  const cEl = choicesEl();
  cEl.innerHTML = "";
  for (const choice of node.choices) {
    const btn = document.createElement("button");
    btn.textContent = choice.label;
    btn.onclick = () => {
      runAction(choice.action);
      if (choice.next === null) { endDialogue(); }
      else { activeNodeId = choice.next; renderNode(); }
    };
    cEl.appendChild(btn);
  }
}

function endDialogue() {
  box().classList.remove("open");
  setLocked(false);
  const cb = onEnd; activeTree = null; activeNodeId = null; onEnd = null;
  if (cb) cb();
}

/** Show a single line with one dismiss choice — used for battle-flow lines. */
export function showLine(speakerName, text) {
  return new Promise(resolve => {
    startDialogue(speakerName, { start: "n", nodes: { n: { text, choices: [{ label: "Okay", next: null }] } } }, resolve);
  });
}
