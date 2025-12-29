import fs from 'node:fs/promises';

export async function isFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}
