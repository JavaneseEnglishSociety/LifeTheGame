// Tile ids: 2 wall(block) 4 tunnel-floor(walk)
const W = 10, H = 8;
const tiles = [], collision = [];
for (let y = 0; y < H; y++) {
  const trow = [], crow = [];
  for (let x = 0; x < W; x++) {
    const border = x === 0 || y === 0 || x === W - 1 || y === H - 1;
    const exitGap = x === 0 && (y === 2 || y === 3); // back to analog_outskirts
    if (border && !exitGap) { trow.push(2); crow.push(1); continue; }
    trow.push(4); crow.push(0);
  }
  tiles.push(trow); collision.push(crow);
}

export default {
  id: "relay_tunnel_01",
  name: "Relay Tunnel",
  era: "analog",
  tileset: "analog",
  width: W, height: H, tileSize: 32,
  tiles, collision,

  spawnPoints: {
    default: { x: 5, y: 4 },
    from_analog_outskirts: { x: 1, y: 2 }
  },

  connectors: [
    {
      id: "to_analog_outskirts",
      type: "tunnel",
      x: 0, y: 2, w: 1, h: 2,
      targetMapId: "analog_outskirts",
      targetSpawnId: "from_relay_tunnel_01",
      requiresFlag: null,
      transitionFx: "tunnelDark"
    }
  ],

  npcSpawns: [],
  itemSpawns: [
    { itemId: "static_shard", x: 5, y: 5, uniqueId: "shard_tunnel_01" }
  ],
  encounterZones: [
    { x: 2, y: 2, w: 6, h: 4, tableId: "tunnel_common" }
  ]
};
