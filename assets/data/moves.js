// Flat move registry. Every creature's movePool references these by id.
export const MOVES = {
  static_pulse: { id: "static_pulse", name: "Static Pulse", power: 35, category: "special", accuracy: 95 },
  hiss_guard:   { id: "hiss_guard",   name: "Hiss Guard",   power: 0,  category: "status",  accuracy: 100, effect: { statChange: { def: 1 }, self: true } },
  carrier_wave: { id: "carrier_wave", name: "Carrier Wave", power: 55, category: "special", accuracy: 90 },
  dial_lock:    { id: "dial_lock",    name: "Dial Lock",    power: 40, category: "physical",accuracy: 100, effect: { status: "jammed", chance: 0.3 } },
  echo_slam:    { id: "echo_slam",    name: "Echo Slam",    power: 50, category: "physical",accuracy: 90 },
  loop_wall:    { id: "loop_wall",    name: "Loop Wall",    power: 0,  category: "status",  accuracy: 100, effect: { statChange: { def: 2 }, self: true } },
  rewind:       { id: "rewind",       name: "Rewind",       power: 0,  category: "status",  accuracy: 100, effect: { heal: 0.3, self: true } },
  desync:       { id: "desync",       name: "Desync",       power: 30, category: "special", accuracy: 85, effect: { status: "desynced", chance: 0.4 } },
  corrupt_burst:{ id: "corrupt_burst",name: "Corrupt Burst",power: 65, category: "special", accuracy: 85 },
  null_frame:   { id: "null_frame",   name: "Null Frame",   power: 75, category: "physical",accuracy: 80 },
  tackle:       { id: "tackle",       name: "Tackle",       power: 30, category: "physical",accuracy: 100 }
};
export function getMove(id) { return MOVES[id]; }
