import relayKeeper from "./relay_keeper.js";
import neonRival01 from "./neon_rival_01.js";

export const NPCS = { [relayKeeper.id]: relayKeeper, [neonRival01.id]: neonRival01 };
export function getNpc(id) { return NPCS[id]; }
