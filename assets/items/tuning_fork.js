export default {
  id: "tuning_fork",
  name: "Tuning Fork",
  category: "battle",
  description: "Restores a little of a Glyph's HP.",
  stackable: true,
  maxStack: 9,
  sprite: { kind: "item", color: "#ff2fd0", glyph: "♪" },
  onUse: { type: "heal", amount: 15 }
};
