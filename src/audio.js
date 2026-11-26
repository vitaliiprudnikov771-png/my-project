export class AudioSystem {
  constructor() {
    this.context = null;
    this.enabled = true;
  }

  start() {
    if (!this.enabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = this.context || new AudioContextClass();
      if (this.context.state === "suspended") {
        this.context.resume().catch(() => {});
      }
    } catch {
      // Audio is optional; gameplay must work when audio is unavailable.
    }
  }

  tone(frequency = 120, duration = .1, type = "sawtooth", volume = .035) {
    if (!this.enabled) return;
    this.start();
    if (!this.context) return;

    try {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const now = this.context.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch {
      // A blocked or unavailable audio device should not interrupt the game loop.
    }
  }

  shot() {
    this.tone(95, .12, "sawtooth", .055);
    this.tone(55, .16, "triangle", .04);
  }

  hit() {
    this.tone(220, .08, "square", .025);
  }

  step() {
    this.tone(65, .04, "triangle", .012);
  }

  toggle(enabled) {
    this.enabled = Boolean(enabled);
  }

  dispose() {
    this.enabled = false;
    const context = this.context;
    this.context = null;
    if (!context || context.state === "closed") return;

    try {
      const closing = context.close();
      closing?.catch?.(() => {});
    } catch {
      // Audio cleanup must never prevent the rest of the page from closing.
    }
  }
}
