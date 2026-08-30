import { getConfig } from '../config/getConfig.ts';

export function getConnectionString(): string {
  const config = getConfig();
  const dbConfig = config.db;

  return `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`;
}
