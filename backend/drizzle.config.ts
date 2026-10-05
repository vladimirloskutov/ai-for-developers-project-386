import { defineConfig } from 'drizzle-kit';

/**
 * Конфигурация Drizzle Kit: генерирует SQL-миграции из src/db/schema.ts
 * в каталог drizzle/ (эти файлы коммитятся в репозиторий).
 */
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './data/app.db',
  },
});
