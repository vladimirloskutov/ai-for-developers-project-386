import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema.js';

export type SqliteClient = Database.Database;
export type Database = ReturnType<typeof drizzle<typeof schema>>;

/** Разрешает путь к файлу БД относительно рабочего каталога процесса. */
export function resolveDatabasePath(url: string): string {
  if (url === ':memory:' || url.startsWith('file:')) {
    return url;
  }

  return isAbsolute(url) ? url : resolve(process.cwd(), url);
}

export function createSqliteClient(url: string): SqliteClient {
  const target = resolveDatabasePath(url);

  if (target !== ':memory:') {
    mkdirSync(dirname(target), { recursive: true });
  }

  const client = new Database(target);

  // WAL даёт нормальные параллельные чтения, внешние ключи нужны для связей таблиц
  client.pragma('journal_mode = WAL');
  client.pragma('foreign_keys = ON');

  return client;
}

export function createDatabase(client: SqliteClient): Database {
  return drizzle(client, { schema });
}
