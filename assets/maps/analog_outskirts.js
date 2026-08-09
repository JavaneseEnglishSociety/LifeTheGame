// Tile ids: 0 grass(walk) 1 path(walk) 2 wall(block) 3 water(block) 4 tunnel-floor(walk)
const W = 16, H = 12;
const tiles = [], collision = [];
for (let y = 0; y < H; y++) {
  const trow = [], crow = [];
  for (let x = 0; x < W; x++) {
    const border = x === 0 || y === 0 || x === W - 1 || y === H - 1;
    const tunnelGap = x === W - 1 && (y === 5 || y === 6); // opening to relay_tunnel_01
    if (border && !tunnelGap) { trow.push(2); crow.push(1); continue; }
    if (y === 8) { trow.push(1); crow.push(0); continue; } // horizontal path
    trow.push(0); crow.push(0); // grass
  }
  tiles.push(trow); collision.push(crow);
}

export default {
  id: "analog_outskirts",
  name: "Analog Outskirts",
  era: "analog",
  tileset: "analog",
  width: W, height: H, tileSize: 32,
  tiles, collision,

  spawnPoints: {
    default: { x: 3, y: 6 },
    from_relay_tunnel_01: { x: 13, y: 5 }
  },

  connectors: [
    {
      id: "to_relay_tunnel_01",
      type: "tunnel",
      x: 15, y: 5, w: 1, h: 2,
      targetMapId: "relay_tunnel_01",
      targetSpawnId: "from_analog_outskirts",
      requiresFlag: null,
      transitionFx: "tunnelDark"
    }
  ],

  npcSpawns: [
    { npcId: "relay_keeper", x: 4, y: 4, facing: "down" },
    { npcId: "neon_rival_01", x: 9, y: 3, facing: "down" }
  ],

  itemSpawns: [
    { itemId: "static_shard", x: 6, y: 9, uniqueId: "shard_outskirts_01" },
    { itemId: "static_shard", x: 10, y: 9, uniqueId: "shard_outskirts_02" },
    { itemId: "static_shard", x: 8, y: 2, uniqueId: "shard_outskirts_03" },
    { itemId: "signal_flare", x: 12, y: 9, uniqueId: "flare_outskirts_01" }
  ],

  encounterZones: [
    { x: 1, y: 9, w: 6, h: 2, tableId: "analog_common" },
    { x: 9, y: 9, w: 5, h: 2, tableId: "analog_common" }
  ]
};
