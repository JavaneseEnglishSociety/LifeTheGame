export default {
  id: "tuner",
  name: "Tuner",
  era: "analog",
  category: "Signal",
  description: "A flickering dial-shaped Glyph born from an old crystal radio. It hums when it's happy.",
  sprite: { kind: "blob", base: "#caa24a", accent: "#ffcf5c", eye: "#2a1c00" },
  baseStats: { hp: 38, atk: 30, def: 28, spa: 34, spd: 26, spe: 32, acc: 92, luk: 40 },
  movePool: [
    { level: 1, moveId: "static_pulse" },
    { level: 1, moveId: "hiss_guard" },
    { level: 5, moveId: "carrier_wave" },
    { level: 12, moveId: "dial_lock" }
  ],
  evolvesInto: null,
  evolutionCondition: null
};
