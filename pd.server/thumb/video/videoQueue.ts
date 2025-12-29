import { TaskQueue } from "../queue.ts";
import { getConfig } from "../../config/getConfig.ts";

let queue: TaskQueue;

export function getVideoQueue(): TaskQueue {
  if (!queue) {
    queue = new TaskQueue(getConfig().thumbGeneration.VIDEO.parallelFactor);
  }

  return queue;
}
