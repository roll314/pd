import {Md5} from 'npm:ts-md5@1.3.1';
import { IUserSession } from '../utils/userSessions.ts';
import { getDavUser } from './getRootFolders.ts';
import { readdir } from 'node:fs/promises';
import { Dirent, statSync } from 'node:fs';
import * as path from '@std/path';
import { Router } from '@oak/oak';
import {CommonErrorResponse} from '../models/commonErrorResponse.ts';

export interface IGetFolderDataRequest {
  folderName: string;
  subPath: string;

  offset: number;
  limit: number;
}

export enum FSItemType {
  FOLDER = "FOLDER",
  FILE = "FILE",
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

export function getFolderData(router: Router) {
  router.get('/api/folderData', async ctx => {
    const query = ctx.state.query as IGetFolderDataRequest;

    const userSession: IUserSession = ctx.state.session;

    const davUser = getDavUser(userSession.user.username);
    if (!davUser) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'no dav user found' } as CommonErrorResponse;

      return;
    }

    const folderName = query.folderName.at(-1) === '/' ? query.folderName.slice(0, -1) : query.folderName;

    const foundDir = davUser.rootDirectories.find((dir) => dir.name === folderName);
    if (!foundDir) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'no dav dir found' } as CommonErrorResponse;

      return;
    }

    const physicalPath = path.join(foundDir.physicalPath, query.subPath);

    let dirData: Dirent[];
    try {
      dirData = await readdir(physicalPath, {withFileTypes: true });
    } catch (e) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Cannot read dir' } as CommonErrorResponse;

      return;
    }

    const data: IFSItemInfo[] = dirData
      .map((item) => {
        const fillFilePath = path.join(item.parentPath, item.name);

        const stats = statSync(fillFilePath);

        return {
          uid: Md5.hashStr(fillFilePath),
          name: item.name,
          type: item.isDirectory() ? FSItemType.FOLDER : FSItemType.FILE,
          size: item.isFile() ? stats.size : -1,
          changedAt: stats.ctimeMs,
          createdAt: stats.birthtimeMs || stats.atimeMs
        } as IFSItemInfo;
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === FSItemType.FOLDER ? -1 : 1;
        }

        return b.createdAt - a.createdAt;
      });

    const offset = +query.offset;
    const limit = +query.limit;

    const startIndex = offset;
    const endIndex = offset + limit;

    const dataSlice = data.slice(startIndex, endIndex);

    const result: GetFolderDataResponse = {
      data: dataSlice,
      hasNextPage: endIndex <= data.length,
      totalCount: data.length,
    };

    ctx.response.status = 200;
    ctx.response.body = result;
  });
}
