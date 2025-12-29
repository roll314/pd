import { defineConfig } from 'drizzle-kit';
import { IDotEnvConfig } from './config/models.ts';

const env = Deno.env.toObject() as unknown as IDotEnvConfig;

const connectionString = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

console.log(`Connection string: ${connectionString}`);

export default defineConfig({
  out: './db/migrations',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
});
