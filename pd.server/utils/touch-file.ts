import fs from "node:fs";
import {LOCKED_ERROR} from '../dav/lockedError.ts';

export function touchFile(filename: string) {
  // Флаг wx атомарно создаёт lock-файл и исключает гонку между параллельными задачами.
  try {
    const fd = fs.openSync(filename, 'wx');
    fs.closeSync(fd);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error(LOCKED_ERROR);
    }

    throw e;
  }
}
