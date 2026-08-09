export default {
  id: "q001_first_signal",
  name: "First Signal",
  description: "Collect 3 Static Shards for the Relay Keeper.",
  steps: [
    { id: "collect", type: "collect", target: "static_shard", count: 3, description: "Static Shards: {progress}/3" },
    { id: "return", type: "talk", target: "relay_keeper", description: "Return to the Relay Keeper." }
  ],
  onComplete: {
    flags: { bleed_stage: 1 },
    items: { tuning_fork: 1 },
    unlockMaps: []
  }
};
