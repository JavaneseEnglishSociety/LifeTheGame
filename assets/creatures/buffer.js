export default {
  id: "buffer",
  name: "Buffer",
  era: "neon",
  category: "Loop",
  description: "A stuttering Glyph that repeats the last half-second of sound forever. Hard to knock down, harder to hurry.",
  sprite: { kind: "blob", base: "#ff2fd0", accent: "#2fe4ff", eye: "#1a0016", spiky: true },
  baseStats: { hp: 58, atk: 24, def: 46, spa: 20, spd: 38, spe: 14, acc: 88, luk: 30 },
  movePool: [
    { level: 1, moveId: "echo_slam" },
    { level: 1, moveId: "loop_wall" },
    { level: 8, moveId: "rewind" }
  ],
  evolvesInto: null,
  evolutionCondition: null
};
