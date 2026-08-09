import staticShard from "./static_shard.js";
import signalFlare from "./signal_flare.js";
import tuningFork from "./tuning_fork.js";

export const ITEMS = { [staticShard.id]: staticShard, [signalFlare.id]: signalFlare, [tuningFork.id]: tuningFork };
export function getItem(id) { return ITEMS[id]; }
