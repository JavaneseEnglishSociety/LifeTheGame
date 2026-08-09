export default {
  id: "signal_flare",
  name: "Signal Flare",
  category: "field",
  description: "Lights the way through dead zones for a short while.",
  stackable: true,
  maxStack: 9,
  sprite: { kind: "item", color: "#2fe4ff", glyph: "✦" },
  onUse: { type: "field_effect", effect: "reveal_dark_zone", durationSec: 30 }
};
