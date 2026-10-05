import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../app.js';
import type { HealthResponse } from './health.js';

describe('GET /health', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    app = await buildApp({
      config: { NODE_ENV: 'test', LOG_LEVEL: 'silent', DATABASE_URL: ':memory:' },
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('отвечает 200 со статусом ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json<HealthResponse>()).toMatchObject({
      status: 'ok',
      service: 'calendar-booking-api',
    });
  });

  it('отдаёт JSON с полями uptime и timestamp', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    const body = response.json<HealthResponse>();

    expect(response.headers['content-type']).toContain('application/json');
    expect(body.status).toBe('ok');
    expect(typeof body.uptime).toBe('number');
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it('не отвечает на неизвестный маршрут', async () => {
    const response = await app.inject({ method: 'GET', url: '/unknown' });

    expect(response.statusCode).toBe(404);
  });
});
