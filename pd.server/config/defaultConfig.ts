import {DeepReadonly} from '../utils/deepReadonly.ts';
import {IConfig, RootDirectoryRole} from './models.ts';
import {LogLevel} from '../utils/log.ts';
import {DavLogLevel} from '../dav/logLevel.ts';
import {SupportedFileType} from '../../shared/isFileSupported.ts';
import {HttpLogLevel} from '../http/models/logLevel.ts';

const HUNDRED_GIGA_BYTES = 1024 * 1024 * 1024 * 100;

export const defaultConfig: DeepReadonly<IConfig> = {
  db: {
    host: 'db',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    dbName: 'appdb'
  },
  httpsServer: {
    port: 8080,
    hostname: '0.0.0.0',
    certCrtPath: './server.crt',
    certKeyPath: './server.key',
    clientDir: '../pd.client/dist/client/browser',
    logLevel: HttpLogLevel.REQUEST,
    thumbCacheIntervalSec: 31536000,
  },
  davServer: {
    rootDirPhysicalPath: '/home_nas_pseudo_root',
    port: 2000,
    hostname: '0.0.0.0',
    certCrtPath: './server.crt',
    certKeyPath: './server.key',
    defaultUserQuotaBytes: -1,
    totalDiskSizeBytes: HUNDRED_GIGA_BYTES,
    users: [
      {
        quotaBytes: -1,
        username: 'dummy',
        password: 'password',
        rootDirectories: [{
          name: 'testDir',
          physicalPath: './testDir',
          roles: [
            RootDirectoryRole.CAN_WRITE,
            RootDirectoryRole.ALL,
          ],
        }],
      },
    ],
    logLevel: DavLogLevel.REQUEST,
  },
  thumbGeneration: {
    pathToThumbs: 'C:/tmp',
    [SupportedFileType.IMAGE]: {
      parallelFactor: 10,
      previewThumbSizePx: 1200,
      gridThumbSizePx: 200,
      smallThumbSizePx: 60,
      bigThumbSizePx: 200,
      pathToNConvert: './bin/win/NConvert/nconvert.exe',
    },
    [SupportedFileType.VIDEO]: {
      pathToFFMpeg: './bin/win/ffmpeg/bin/ffmpeg.exe',
      parallelFactor: 10,
      previewThumbSizePx: 1200,
      previewVideoSizePx: 400,
      gridThumbSizePx: 200,
      smallThumbSizePx: 60,
      bigThumbSizePx: 200,
    },
    [SupportedFileType.DOCUMENT]: {},
  },
  common: {
    logLevel: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.LOG],
  },
};
