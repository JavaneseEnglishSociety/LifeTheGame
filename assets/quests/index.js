import q001FirstSignal from "./q001_first_signal.js";

export const QUESTS = { [q001FirstSignal.id]: q001FirstSignal };
export function getQuest(id) { return QUESTS[id]; }
