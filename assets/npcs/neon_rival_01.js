export default {
  id: "neon_rival_01",
  name: "Jinx",
  sprite: { kind: "person", skin: "#e0b090", hair: "#ff2fd0", top: "#2a2a3a", accent: "#2fe4ff" },
  static: true,
  interactionRadius: 1,
  dialogue: {
    start: "chat",
    nodes: {
      chat: {
        text: "You're new around the relay, huh? Cute.",
        choices: [{ label: "...", next: null }]
      }
    }
  },
  trainer: {
    team: [
      { speciesId: "buffer", level: 6, moveIds: null },
      { speciesId: "tuner", level: 8, moveIds: ["static_pulse", "dial_lock"] }
    ],
    rewards: {
      blicks: { min: 40, max: 60 },
      guaranteedItems: [{ itemId: "tuning_fork", count: 1 }],
      possibleItems: [{ itemId: "signal_flare", count: 1, chance: 0.3 }]
    },
    rechallengeable: true,
    rechallengeCooldownHours: 20,
    aiTier: "tactical",
    dialogueBattle: {
      preBattle: "Bet your Glyph can't keep up with mine. Let's tune.",
      victory: "...Yeah, yeah. Good tuning.",
      defeat: "Told you. Come back when you've leveled up.",
      alreadyDefeated: "Still can't believe I lost to you.",
      rechallengeOffer: "Round two? I've been practicing.",
      onCooldown: "Give me a bit — I'm still recalibrating."
    }
  }
};
