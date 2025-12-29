import { TaskQueue } from "../queue.ts";
import { getConfig } from "../../config/getConfig.ts";

let queue: TaskQueue;

export function getImageQueue(): TaskQueue {
  if (!queue) {
    queue = new TaskQueue(getConfig().thumbGeneration.IMAGE.parallelFactor);
  }

  return queue;
}
