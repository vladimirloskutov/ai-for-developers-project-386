import type { FastifyPluginAsync } from 'fastify';

export interface HealthResponse {
  status: 'ok';
  service: string;
  uptime: number;
  timestamp: string;
}

/**
 * Health-check для CI и для ручной проверки: приложение поднялось и отвечает.
 */
const healthRoutes: FastifyPluginAsync = async (app) => {
  // Синхронный обработчик: Fastify сам оборачивает результат в Promise
  app.get('/health', (): HealthResponse => ({
    status: 'ok',
    service: 'calendar-booking-api',
    uptime: Number(process.uptime().toFixed(3)),
    timestamp: new Date().toISOString(),
  }));
};

export default healthRoutes;
