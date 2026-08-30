import {Md5} from 'npm:ts-md5@1.3.1';

export async function getEtag(filePath: string): Promise<string | null> {
  try {
    const fileInfo = await Deno.stat(filePath);
    const mtimeMs = fileInfo.mtime?.getTime() || 0;
    const etagBase = `${mtimeMs}-${fileInfo.size}`;
    const hash = Md5.hashStr(etagBase);
    return `"${hash}"`;
  } catch {
    return null;
  }
}
