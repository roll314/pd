import {ThumbSize} from '../../shared/thumbSize.ts';
import {generateThumb} from '../dav/generateThumb.ts';
import {getThumbFileHashSource} from './getThumbFileHashSource.ts';

const jobs = new Map<string, Promise<void>>();
const failedJobs = new Map<string, {error: Error; expiredAt: number}>();
const FAILED_JOB_CACHE_INTERVAL_MS = 30000;

export function getThumbGenerationError(
  filePath: string,
  thumbSize: ThumbSize,
): Error | null {
  const jobKey = getThumbFileHashSource(filePath, thumbSize);
  const foundError = failedJobs.get(jobKey);
  if (!foundError) {
    return null;
  }

  if (foundError.expiredAt <= Date.now()) {
    failedJobs.delete(jobKey);
    return null;
  }

  return foundError.error;
}

export function scheduleThumbGeneration(
  filePath: string,
  thumbSize: ThumbSize,
): Promise<void> {
  const jobKey = getThumbFileHashSource(filePath, thumbSize);
  const foundJob = jobs.get(jobKey);
  if (foundJob) {
    return foundJob;
  }

  // Один и тот же файл может одновременно появиться в нескольких запросах клиента.
  // Общий Promise не позволяет поставить дублирующие задачи в очередь генератора.
  const job = generateThumb(filePath, thumbSize)
    .then(() => {
      failedJobs.delete(jobKey);
    })
    .catch(e => {
      // Ошибка хранится недолго, чтобы polling клиента завершился, а повторная попытка осталась возможной.
      const error = e instanceof Error ? e : new Error(String(e));
      const failedJob = {
        error,
        expiredAt: Date.now() + FAILED_JOB_CACHE_INTERVAL_MS,
      };
      failedJobs.set(jobKey, failedJob);
      setTimeout(() => {
        if (failedJobs.get(jobKey) === failedJob) {
          failedJobs.delete(jobKey);
        }
      }, FAILED_JOB_CACHE_INTERVAL_MS);
      throw error;
    })
    .finally(() => jobs.delete(jobKey));

  jobs.set(jobKey, job);
  return job;
}
