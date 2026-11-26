export class GameSession {
  constructor() {
    this.state = "menu";
  }

  start() {
    this.state = "game";
    return true;
  }

  pause() {
    if (this.state !== "game") return false;
    this.state = "pause";
    return true;
  }

  resume() {
    if (this.state !== "pause") return false;
    this.state = "game";
    return true;
  }

  quit() {
    this.state = "menu";
  }

  end() {
    if (this.state !== "game") return false;
    this.state = "end";
    return true;
  }

  get active() {
    return this.state === "game";
  }
}
