# AGENTS.md

Инструкции для агентов, работающих с этим репозиторием.

## Проект

Учебный проект Хекслета (`ai-for-developers`): сервис бронирования календаря.
Сейчас в репозитории только рабочая основа (каркас): бэкенд и фронтенд
собираются, поднимаются, отвечают на health-check, проходят проверки в CI.
Функциональности бронирования ещё нет — добавляй её сам.

Подробности про стек и скрипты — в `README.md`.

## Жёсткое ограничение Хекслета

`.github/workflows/hexlet-check.yml` нельзя удалять, переименовывать или
редактировать, как и сам репозиторий. Файл генерируется автоматически.

## Команды

Все команды — из корня, npm workspaces, один lock-файл.

```bash
npm ci                              # чистая установка (как в CI)
npm run dev                         # backend :3000 + frontend :5173
npm run lint                        # ESLint по всему монорепо
npm run format:check                # Prettier --check (CI падает на этом)
npm run typecheck                   # tsc по обоим пакетам
npm test                            # Vitest: backend + frontend
npm run build
```

Только один пакет — через `--workspace`:

```bash
npm run typecheck --workspace backend
npm test --workspace frontend
npm run dev:backend
```

Один тест или один файл (запускать из каталога пакета):

```bash
cd backend && npx vitest run src/routes/health.test.ts
cd backend && npx vitest run -t "не отвечает на неизвестный маршрут"
cd frontend && npx vitest run src/App.test.tsx
```

### Порядок перед коммитом

Хуки Husky ловят проблемы локально, но порядок в CI такой — прогоняй
`npm run lint && npm run typecheck && npm test && npm run build`, иначе
попадёшь на красный PR:

1. `npm run lint`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `npm run format:check` (тоже отдельная проверка в CI)

## Архитектура backend

- `src/app.ts` — `buildApp()`, собирает Fastify **без** `listen`. Тесты
  поднимают приложение здесь, порт не занимается.
- `src/server.ts` — только `listen` + graceful shutdown. Не импортируй
  `server.ts` из тестов.
- Роуты регистрируются как Fastify-плагины (`src/routes/*.ts`).
- `app.db` — подключение Drizzle, добавлено через `decorate` в `app.ts`.
  Тип расширен в `declare module 'fastify'` там же.

### Обязательные расширения импортов

Backend — `module: NodeNext`, поэтому **относительные импорты
всегда с `.js`**, даже для `.ts`-файлов:

```ts
import { buildApp } from './app.js'; // не './app'
import type { HealthResponse } from './health.js';
```

Забытое расширение проходит `tsc` в одном пакете, но ломает `node dist/server.js`.

### Тесты backend

- `buildApp({ config: { NODE_ENV: 'test', DATABASE_URL: ':memory:' } })` —
  иначе тест создаст `backend/data/app.db` на диске.
- Инстанс создаётся в `beforeEach` и закрывается в `afterEach`: `app.close()`
  закрывает и SQLite-соединение через `onClose`.
- `NODE_ENV=test` автоматически отключает логирование (см. `buildApp`).

### Конфигурация

Переменные окружения читает `src/config.ts` через Zod — там же дефолты.
Не дублируй значения по умолчанию в коде, меняй схему. `DATABASE_URL`
разрешается относительно `process.cwd()`, а не относительно `backend/`.

### База данных

- Схема — `backend/src/db/schema.ts`, сейчас пустая (`export {}`).
- Первая таблица → `npm run db:generate`, результат коммитится в `backend/drizzle/`
  (метаданные `.gitignore` **не** игнорирует, специально).
- Применение миграций: `npm run db:migrate`.
- Файлы БД (`backend/data/`, `*.db`) в `.gitignore`, не коммить.

## Архитектура frontend

- Алиас `@` → `src/`, настроен в `vite.config.ts` и в `paths` в `tsconfig.json`.
- Тесты живут в том же `vite.config.ts` (секция `test`), отдельного
  `vitest.config.ts` нет. Окружение — `jsdom`, настройки — `vitest.setup.ts`.
- В `vitest.setup.ts` ручной `afterEach(cleanup)`: автоочистка Testing Library
  работает только при `globals: true`, а здесь глобалы выключены — импортируй
  `describe`/`it`/`expect` из `vitest` явно.
- Переменные окружения объявляй в `src/vite-env.d.ts` (`ImportMetaEnv`).
  Без этого `import.meta.env.VITE_*` даёт `any` и падает линтер.

### shadcn/ui — генерируемый код

- Компоненты в `frontend/src/components/ui/` создаются CLI, а не руками.
  Правь их только если нужно отойти от дефолта.
- Они **исключены из Prettier** (`.prettierignore`) и линкуются ESLint.
  Не «исправляй» их форматирование под Prettier — будет конфликт с `shadcn add`.
- Добавить компонент: `npx shadcn@latest add <name>` (из `frontend/`).
- Preset зафиксирован в `components.json` (`radix-nova`), базовый цвет neutral.
- В `frontend/package.json` уже есть `cn` — отдельные `clsx`/`tailwind-merge`
  не нужны и были удалены как неиспользуемые.
- Шрифт — Inter с кириллицей, а не Geist из пресета (в Geist нет кириллицы).

## Линтинг

- Один `eslint.config.mjs` на монорепо, зоны задаются через `files`.
  Новый пакет = добавить блок с `files: ['<pkg>/**/*.{ts,tsx}']`.
- Типизированные правила (`recommendedTypeChecked`) требуют, чтобы файл
  попадал в какой-то tsconfig. Новый файл вне `include` упадёт с ошибкой
  «not found by the project service» — добавляй в tsconfig пакета.
- `@typescript-eslint/require-await` выключен **только** для `backend/**`:
  контракты Fastify (плагины, хуки) асинхронные по спецификации.
- `react-refresh/only-export-components` выключен для `frontend/src/components/ui/**`:
  shadcn-компоненты экспортируют варианты стилей вместе с компонентом.
- `typescript-eslint` в этой версии — CommonJS: в `eslint.config.mjs`
  импортируется как `import tseslint from 'typescript-eslint'` (default),
  а не через именованный импорт.
- TypeScript зафиксирован на **5.9.x**, потому что peer-диапазон
  `typescript-eslint` — `<6.1.0`. Не повышай до TS 7 без проверки peers.

## Коммиты и релизы

Conventional Commits, проверяются локально (`commit-msg` hook) и в CI:

```
<type>(<scope>): <subject>
```

- Типы: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
  `ci`, `chore`, `revert`. Scope необязателен.
- Заголовок — до 100 символов (`header-max-length`).
- Строки **тела** коммита — тоже до 100 символов: `body-max-line-length`
  приходит из `@commitlint/config-conventional` и рушит хук `commit-msg`.
  Пиши короткими строками с переносами.
- Тема не ограничена по регистру.

### release-please

- Отдельные релизные треки: `backend-vX.Y.Z` и `frontend-vX.Y.Z`.
- Конфиг: `.github/release-please-config.json`, текущие версии —
  `.github/.release-please-manifest.json` (начинаются с `0.0.0`,
  первый релиз будет `0.1.0`).
- Версию руками не править: её двигает release-please в release-PR.
- Права выдаёт блок `permissions` в `.github/workflows/release-please.yml`.
  Там нужен именно `issues: write` — release-please вешает лейблы
  `autorelease: pending` на свой PR, и `pull-requests: write` для этого
  недостаточно. Единственная настройка в интерфейсе GitHub —
  _Allow GitHub Actions to create and approve pull requests_.
- Release-PR **не запускает CI**: события от `GITHUB_TOKEN` не порождают
  новых прогонов workflow. Это ожидаемо, не чини.

## CI

`.github/workflows/ci.yml` — джобы `lint`, `typecheck`, `test`, `build`,
`smoke` и `commitlint` (только на PR). Smoke реально поднимает оба
приложения как процессы и проверяет ответ: backend — `GET /health`
с `{"status":"ok"}`, frontend — собранный HTML с `id="root"`.

Node в CI — 22 (`NODE_VERSION` в workflow), локально проверено на 26.
