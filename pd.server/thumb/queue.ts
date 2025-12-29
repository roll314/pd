export type TaskFn<T = unknown> = () => Promise<T>;

export class TaskQueue {
  private queue: Array<() => Promise<void>> = [];
  private activeCount = 0;
  private idleResolvers: Array<() => void> = [];

  get size(): number {
    return this.queue.length;
  }

  get isIdle(): boolean {
    return this.queue.length === 0 && this.activeCount === 0;
  }

  constructor(public readonly parallelFactor: number = 1) {
  }

  add<T>(task: TaskFn<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.next();
    });
  }

  onIdle(): Promise<void> {
    return this.isIdle
      ? Promise.resolve()
      : new Promise<void>((resolve) => this.idleResolvers.push(resolve));
  }

  private next(): void {
    while (this.activeCount < this.parallelFactor && this.queue.length) {
      const task = this.queue.shift()!;
      this.activeCount++;
      task()
        .finally(() => {
          this.activeCount--;
          this.next();
          if (this.isIdle) {
            this.resolveIdle();
          }
        });
    }
  }

  private resolveIdle(): void {
    while (this.idleResolvers.length) {
      const resolve = this.idleResolvers.shift()!;
      resolve();
    }
  }
}
