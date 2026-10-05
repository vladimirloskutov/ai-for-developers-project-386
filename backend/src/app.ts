import Fastify, { type FastifyInstance } from 'fastify';

import { loadConfig, type Config } from './config.js';
import { createDatabase, createSqliteClient } from './db/client.js';
import healthRoutes from './routes/health.js';

declare module 'fastify' {
  interface FastifyInstance {
    /** Подключение к базе, доступно в плагинах и роутах как app.db */
    db: ReturnType<typeof createDatabase>;
  }
}

export interface BuildAppOptions {
  /** Переопределения конфигурации — используются в тестах */
  config?: Partial<Config>;
  /** Принудительно включить или выключить логирование */
  logger?: boolean;
}

/**
 * Собирает приложение Fastify без вызова listen: так его можно поднимать
 * в тестах через app.inject() и не занимать порт.
 */
export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const config: Config = { ...loadConfig(), ...options.config };
  const withLogger = options.logger ?? config.NODE_ENV !== 'test';

  // В тестах логирование выключено целиком, поэтому и запросы не пишутся
  const app = Fastify({
    logger: withLogger ? { level: config.LOG_LEVEL } : false,
  });

  const sqlite = createSqliteClient(config.DATABASE_URL);
  app.decorate('db', createDatabase(sqlite));
  app.addHook('onClose', () => {
    sqlite.close();
  });

  await app.register(healthRoutes);

  return app;
}
