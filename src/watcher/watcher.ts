import { EventEmitter } from "eventemitter3";
import { FSWatcher, watch } from "node:fs";

type WatcherEvent = {
  changed: () => void;
};

class Watcher extends EventEmitter<WatcherEvent> {
  #watching: Map<string, FSWatcher> = new Map()
  public watchFiles = (files: string[]) => {
    for (const file of files) {
      if (this.#watching.has(file)) {
        continue;
      }
      const watcher = watch(file, () => {
        this.emit("changed");
      });
      this.#watching.set(file, watcher);
    }
  }
}

export { Watcher }
