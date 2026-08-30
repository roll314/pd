import {Md5} from 'npm:ts-md5@1.3.1';
import {IUserSession} from '../utils/userSessions.ts';
import {getDavUser} from './getRootFolders.ts';
import {readdir, stat} from 'node:fs/promises';
import {Dirent} from 'node:fs';
import * as path from '@std/path';
import {Router} from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';

const MAX_FILES_LIMIT = 500;
const FILE_STAT_PARALLEL_FACTOR = 16;
const FOLDER_CACHE_INTERVAL_MS = 2000;

export interface IGetFolderDataRequest {
  folderName: string;
  subPath: string;

  offset: number;
  limit: number;
}

export enum FSItemType {
  FOLDER = 'FOLDER',
  FILE = 'FILE',
}

export interface IFSItemInfo {
  uid: string;
  name: string;
  type: FSItemType;
  size: number;
  changedAt: number;
  createdAt: number;
}

export interface GetFolderDataResponse {
  data: IFSItemInfo[];
  totalCount: number;
  hasNextPage: boolean;
}

interface IFolderCacheItem {
  expiredAt: number;
  data: IFSItemInfo[];
}

const folderCache = new Map<string, IFolderCacheItem>();

async function readFolderData(physicalPath: string): Promise<IFSItemInfo[]> {
  const foundCacheItem = folderCache.get(physicalPath);
  if (foundCacheItem && foundCacheItem.expiredAt > Date.now()) {
    return foundCacheItem.data;
  }

  const dirData = await readdir(physicalPath, {withFileTypes: true});
  const data = new Array<IFSItemInfo>(dirData.length);
  let nextIndex = 0;

  // Ограниченная очередь не блокирует event loop синхронными stat и не создаёт тысячи операций сразу.
  await Promise.all(Array.from({length: FILE_STAT_PARALLEL_FACTOR}, async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= dirData.length) {
        return;
      }

      const item: Dirent = dirData[index];
      const fullFilePath = path.join(physicalPath, item.name);
      const stats = await stat(fullFilePath);

      data[index] = {
        uid: Md5.hashStr(fullFilePath),
        name: item.name,
        type: item.isDirectory() ? FSItemType.FOLDER : FSItemType.FILE,
        size: item.isFile() ? stats.size : -1,
        changedAt: stats.ctimeMs,
        createdAt: stats.birthtimeMs || stats.atimeMs,
      };
    }
  }));

  data.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === FSItemType.FOLDER ? -1 : 1;
    }

    return b.createdAt - a.createdAt;
  });

  folderCache.set(physicalPath, {
    expiredAt: Date.now() + FOLDER_CACHE_INTERVAL_MS,
    data,
  });

  return data;
}

export function getFolderData(router: Router) {
  router.get('/api/folderData', async ctx => {
    const query = ctx.state.query as IGetFolderDataRequest;
    const userSession: IUserSession = ctx.state.session;
    const davUser = getDavUser(userSession.user.username);

    if (!davUser) {
      ctx.response.status = 404;
      ctx.response.body = {error: 'no dav user found'} as CommonErrorResponse;
      return;
    }

    const folderName = query.folderName.at(-1) === '/' ? query.folderName.slice(0, -1) : query.folderName;
    const foundDir = davUser.rootDirectories.find(dir => dir.name === folderName);
    if (!foundDir) {
      ctx.response.status = 404;
      ctx.response.body = {error: 'no dav dir found'} as CommonErrorResponse;
      return;
    }

    const physicalPath = path.join(foundDir.physicalPath, query.subPath);

    let data: IFSItemInfo[];
    try {
      data = await readFolderData(physicalPath);
    } catch {
      ctx.response.status = 400;
      ctx.response.body = {error: 'Cannot read dir'} as CommonErrorResponse;
      return;
    }

    const offset = Math.max(0, Number(query.offset) || 0);
    const limit = Math.min(MAX_FILES_LIMIT, Math.max(1, Number(query.limit) || MAX_FILES_LIMIT));
    const endIndex = offset + limit;

    const result: GetFolderDataResponse = {
      data: data.slice(offset, endIndex),
      hasNextPage: endIndex < data.length,
      totalCount: data.length,
    };

    ctx.response.status = 200;
    ctx.response.body = result;
  });
}
