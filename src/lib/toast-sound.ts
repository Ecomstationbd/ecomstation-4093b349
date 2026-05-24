import { toast } from "sonner";

let ctx: AudioContext | null = null;
function playBeep() {
  try {
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.36);
  } catch {}
}

const methods = ["success", "error", "info", "warning", "message"] as const;
methods.forEach((m) => {
  const orig = (toast as any)[m];
  if (typeof orig === "function") {
    (toast as any)[m] = (...args: any[]) => {
      playBeep();
      return orig(...args);
    };
  }
});
