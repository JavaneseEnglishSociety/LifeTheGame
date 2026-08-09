import analogOutskirts from "./analog_outskirts.js";
import relayTunnel01 from "./relay_tunnel_01.js";

export const MAPS = { [analogOutskirts.id]: analogOutskirts, [relayTunnel01.id]: relayTunnel01 };
export function getMap(id) { return MAPS[id]; }

// Wild encounter tables, keyed by tableId referenced from a map's encounterZones.
export const ENCOUNTER_TABLES = {
  analog_common: [
    { speciesId: "tuner", weight: 70, levelRange: [3, 6] },
    { speciesId: "buffer", weight: 20, levelRange: [3, 5] },
    { speciesId: "rift", weight: 10, levelRange: [4, 6] }
  ],
  tunnel_common: [
    { speciesId: "buffer", weight: 55, levelRange: [5, 8] },
    { speciesId: "rift", weight: 45, levelRange: [5, 8] }
  ]
};
