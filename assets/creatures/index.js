import tuner from "./tuner.js";
import buffer from "./buffer.js";
import rift from "./rift.js";

export const CREATURES = { [tuner.id]: tuner, [buffer.id]: buffer, [rift.id]: rift };
export function getCreature(id) { return CREATURES[id]; }
