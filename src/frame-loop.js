export function createFrameLoop(callback, scheduler) {
  if (typeof callback !== "function") {
    throw new TypeError("Frame callback must be a function");
  }
  if (typeof scheduler?.request !== "function" || typeof scheduler?.cancel !== "function") {
    throw new TypeError("Frame scheduler must provide request and cancel functions");
  }

  let active = false;
  let frameHandle = null;

  function tick(timestamp) {
    if (!active) return;
    frameHandle = null;

    try {
      callback(timestamp);
    } catch (error) {
      active = false;
      frameHandle = null;
      throw error;
    }

    if (active) frameHandle = scheduler.request(tick);
  }

  return {
    start() {
      if (active) return false;
      active = true;
      try {
        frameHandle = scheduler.request(tick);
      } catch (error) {
        active = false;
        throw error;
      }
      return true;
    },

    stop() {
      if (!active) return false;
      active = false;
      if (frameHandle !== null) scheduler.cancel(frameHandle);
      frameHandle = null;
      return true;
    },

    get active() {
      return active;
    }
  };
}
