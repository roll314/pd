import {Injectable} from '@angular/core';

const MAX_PARALLEL_IMAGE_LOADS = 6;

export interface ImageLoadTaskHandle {
  cancel(): void;
  complete(): void;
}

interface ImageLoadTask {
  state: 'QUEUED' | 'ACTIVE' | 'DONE';
  start: () => void;
}

@Injectable({providedIn: 'root'})
export class ImageLoadSchedulerService {
  private readonly queue: ImageLoadTask[] = [];
  private activeCount = 0;

  schedule(start: () => void): ImageLoadTaskHandle {
    const task: ImageLoadTask = {state: 'QUEUED', start};
    this.queue.push(task);
    this.runNext();

    return {
      cancel: () => this.finish(task),
      complete: () => this.finish(task),
    };
  }

  private finish(task: ImageLoadTask) {
    if (task.state === 'DONE') {
      return;
    }

    if (task.state === 'QUEUED') {
      // Запрос ещё не начался: достаточно убрать его из очереди.
      const index = this.queue.indexOf(task);
      if (index >= 0) {
        this.queue.splice(index, 1);
      }
    } else {
      // Активный <img> удаляется компонентом, поэтому браузер прерывает загрузку самостоятельно.
      this.activeCount--;
    }

    task.state = 'DONE';
    this.runNext();
  }

  private runNext() {
    // Ограничение защищает локальный сервер и браузер от сотен одновременных запросов.
    while (this.activeCount < MAX_PARALLEL_IMAGE_LOADS && this.queue.length) {
      const task = this.queue.shift()!;
      if (task.state !== 'QUEUED') {
        continue;
      }

      task.state = 'ACTIVE';
      this.activeCount++;
      try {
        task.start();
      } catch (e) {
        this.finish(task);
        throw e;
      }
    }
  }
}
