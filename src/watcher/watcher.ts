import { FSWatcher, watch } from 'node:fs';

import { EventEmitter } from 'eventemitter3';

type WatcherEvent = {
  changed: () => void;
};

class Watcher extends EventEmitter<WatcherEvent> {
  #watching = new Map<string, FSWatcher>();
  public watchFiles = (files: string[]) => {
    for (const file of files) {
      if (this.#watching.has(file)) {
        continue;
      }
      const watcher = watch(file, () => {
        this.emit('changed');
      });
      this.#watching.set(file, watcher);
    }
  };
}

export { Watcher };
