// Tiny global event bus shared by every engine module.
class Bus extends EventTarget {
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  on(type, fn) { this.addEventListener(type, e => fn(e.detail)); }
}
export const bus = new Bus();
