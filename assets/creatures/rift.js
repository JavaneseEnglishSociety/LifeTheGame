export default {
  id: "rift",
  name: "Rift",
  era: "glitch",
  category: "Corrupt",
  description: "A Glyph that shouldn't exist in any single era — it flickers between all four at once. Unstable, and it knows it.",
  sprite: { kind: "shard", base: "#1a1a22", accent: "#ff2fd0", accent2: "#2fe4ff" },
  baseStats: { hp: 30, atk: 44, def: 20, spa: 50, spd: 22, spe: 46, acc: 80, luk: 60 },
  movePool: [
    { level: 1, moveId: "desync" },
    { level: 10, moveId: "corrupt_burst" },
    { level: 18, moveId: "null_frame" }
  ],
  evolvesInto: null,
  evolutionCondition: null
};
