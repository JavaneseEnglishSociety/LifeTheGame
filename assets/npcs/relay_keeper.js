export default {
  id: "relay_keeper",
  name: "Relay Keeper",
  sprite: { kind: "person", skin: "#e0b090", hair: "#8a8a78", top: "#5a5a4a", accent: "#c9c9b8" },
  static: true,
  interactionRadius: 1,
  dialogue: {
    start: "greeting",
    nodes: {
      greeting: {
        text: "The tower's been humming wrong since the Bleed started.",
        choices: [
          { label: "What's the Bleed?", next: "explain_bleed" },
          { label: "Can you help me?", next: "offer_quest" },
          { label: "Goodbye", next: null }
        ]
      },
      explain_bleed: {
        text: "Every era we ever broadcast is leaking into the next one. It's not supposed to mix.",
        choices: [{ label: "...", next: "greeting" }]
      },
      offer_quest: {
        text: "Bring me three Static Shards from the outskirts and I'll show you something.",
        choices: [
          { label: "I'll do it.", next: "quest_started", action: { type: "startQuest", questId: "q001_first_signal" } },
          { label: "Not now.", next: null }
        ]
      },
      quest_started: {
        text: "Good. Mind the grass out there — it isn't empty.",
        choices: [{ label: "Got it.", next: null }]
      }
    }
  }
};
