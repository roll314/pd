import {getArgs} from '../utils/getArgs.ts';
// @ts-types='npm:@types/lodash-es'
import * as lodash from 'npm:lodash-es@4.17.21';
import {defaultConfig} from './defaultConfig.ts';
import { IConfig, IDotEnvConfig } from './models.ts';

let config: IConfig;

export function getConfig(): IConfig {
  if (config) {
    return config;
  }

  const configPath = getArgs().configPath;
  const decoder = new TextDecoder('utf-8');
  const rawConfigBuffer = Deno.readFileSync(configPath);
  const rawConfig = decoder.decode(rawConfigBuffer);

  const readConfig: Partial<IConfig> = JSON.parse(rawConfig);

  config = lodash.merge(defaultConfig, readConfig);

  const env = Deno.env.toObject() as unknown as IDotEnvConfig;

  config.httpsServer.port = env.SERVER_HTTPS_PORT ?? config.httpsServer.port;
  config.davServer.port = env.SERVER_DAV_PORT ?? config.davServer.port;

  config.db.port = env.DB_PORT ?? config.db.port;
  config.db.user = env.DB_USER ?? config.db.user;
  config.db.password = env.DB_PASSWORD ?? config.db.password;
  config.db.host = env.SERVER_DB_HOST ?? config.db.host;
  config.db.dbName = env.DB_NAME ?? config.db.dbName;

  return config;
}
