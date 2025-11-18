import { createClient } from '@libsql/client';

export const rawClient = createClient({
  url: process.env.DATABASE_URL || 'file:./.data/dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});
