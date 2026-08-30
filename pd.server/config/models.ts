import {LogLevel} from '../utils/log.ts';
import {DavLogLevel} from '../dav/logLevel.ts';
import {SupportedFileType} from '../../shared/isFileSupported.ts';
import {HttpLogLevel} from '../http/models/logLevel.ts';

export interface IDavUser {
  username: string;
  password: string;
  quotaBytes: number;
  rootDirectories: IRootDirectory[];
}

export enum RootDirectoryRole {
  CAN_READ = "canRead",
  CAN_WRITE = "canWrite",
  ALL = "all",
}

export interface IRootDirectory {
  name: string;
  physicalPath: string;
  roles: RootDirectoryRole[];
}

export interface IImageThumbGeneratorConfig {
  parallelFactor: number;
  previewThumbSizePx: number;
  gridThumbSizePx: number;
  smallThumbSizePx: number;
  bigThumbSizePx: number;
  pathToNConvert: string;
}

export interface IVideoThumbGeneratorConfig {
  parallelFactor: number;
  previewThumbSizePx: number;
  previewVideoSizePx: number;
  gridThumbSizePx: number;
  smallThumbSizePx: number;
  bigThumbSizePx: number;
  pathToFFMpeg: string;
}

export interface IDocumentThumbGeneratorConfig {
}

export interface IDotEnvConfig {
  CLIENT_PORT: number;
  SERVER_HTTPS_PORT: number;
  SERVER_DAV_PORT: number;
  SERVER_DB_HOST: string;
  DB_HOST: string;
  DB_PORT: number
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

export interface IConfig {
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    dbName: string;
  },
  httpsServer: {
    port: number;
    hostname: string;
    certCrtPath: string;
    certKeyPath: string;
    clientDir: string;
    logLevel: HttpLogLevel;
    thumbCacheIntervalSec: number;
  };
  davServer: {
    rootDirPhysicalPath: string;
    port: number;
    hostname: string;
    certCrtPath: string;
    certKeyPath: string;
    defaultUserQuotaBytes: number;
    totalDiskSizeBytes: number;
    users: IDavUser[];
    logLevel: DavLogLevel;
  };
  thumbGeneration: {
    pathToThumbs: string;
    [SupportedFileType.IMAGE]: IImageThumbGeneratorConfig;
    [SupportedFileType.VIDEO]: IVideoThumbGeneratorConfig;
    [SupportedFileType.DOCUMENT]: IDocumentThumbGeneratorConfig;
  };
  common: {
    logLevel: LogLevel[];
  };
}
