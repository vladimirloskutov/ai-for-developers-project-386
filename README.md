# Календарь звонков

[![hexlet-check](https://github.com/vladimirloskutov/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/vladimirloskutov/ai-for-developers-project-386/actions/workflows/hexlet-check.yml)
[![CI](https://github.com/vladimirloskutov/ai-for-developers-project-386/actions/workflows/ci.yml/badge.svg)](https://github.com/vladimirloskutov/ai-for-developers-project-386/actions/workflows/ci.yml)

Разработайте совместно с ИИ сервис для бронирования календаря

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

Сейчас в репозитории лежит рабочая основа: оба приложения собираются,
поднимаются, отвечают на health-check, проходят линтер, типы и тесты в CI.
Функциональность бронирования добавляется следующими шагами.

## Стек

- Монорепо на npm workspaces
- Backend: Node.js 22+, Fastify 5, TypeScript 5.9, Zod для конфигурации
- База данных: SQLite + Drizzle ORM, миграции в `backend/drizzle`
- Frontend: React 19, TypeScript, Vite 8, Tailwind CSS 4
- UI: [shadcn/ui](https://ui.shadcn.com) (Radix, нейтральная тема, Inter c кириллицей)
- Тесты: Vitest (backend — `app.inject()`, frontend — Testing Library)
- Линтеры: ESLint 10 (flat config, типизированные правила) и Prettier 3
- CI: GitHub Actions, автоматические релизы — release-please

## Установка

```bash
git clone https://github.com/vladimirloskutov/ai-for-developers-project-386.git
cd ai-for-developers-project-386
npm install
```

Нужен Node.js 22 или новее. Файл `.env` создавать не обязательно: все
переменные имеют значения по умолчанию. Скопируйте `.env.example` в `.env`,
если нужно что-то переопределить.

## Использование

Поднимает backend и frontend вместе:

```bash
npm run dev
```

- frontend — http://localhost:5173
- backend — http://localhost:3000, health-check — http://localhost:3000/health

<!-- Добавьте примеры запуска и запись asciinema — именно это смотрит работодатель -->

Отдельно:

```bash
npm run dev:backend     # только API
npm run dev:frontend    # только веб
```

## Скрипты

Все команды запускаются из корня репозитория.

| Команда                | Что делает                                  |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Backend и frontend одновременно             |
| `npm run build`        | Сборка обоих приложений                     |
| `npm run start`        | Запуск собранного backend                   |
| `npm run preview`      | Локальный просмотр собранного frontend      |
| `npm test`             | Тесты backend и frontend                    |
| `npm run typecheck`    | Проверка типов в обоих пакетах              |
| `npm run lint`         | ESLint по всему монорепо                    |
| `npm run lint:fix`     | ESLint с автоисправлениями                  |
| `npm run format`       | Prettier по всему монорепо                  |
| `npm run format:check` | Проверка форматирования (используется в CI) |
| `npm run db:generate`  | Сгенерировать SQL-миграцию из схемы         |
| `npm run db:migrate`   | Применить миграции к локальной базе         |
| `npm run db:studio`    | Открыть Drizzle Studio                      |

Перед коммитом срабатывают хуки Husky: `lint-staged` проверяет изменённые
файлы, `commitlint` — заголовок коммита.

## Конфигурация backend

Переменные окружения (значения по умолчанию — в `backend/src/config.ts`):

| Переменная     | По умолчанию    | Назначение                 |
| -------------- | --------------- | -------------------------- |
| `NODE_ENV`     | `development`   | Режим приложения           |
| `HOST`         | `0.0.0.0`       | Интерфейс прослушивания    |
| `PORT`         | `3000`          | Порт HTTP                  |
| `LOG_LEVEL`    | `info`          | Уровень логирования pino   |
| `DATABASE_URL` | `./data/app.db` | Файл SQLite или `:memory:` |

Frontend читает `VITE_API_URL` (по умолчанию `http://localhost:3000`);
в dev запросы к `/api` идут через прокси Vite.

## Коммиты и релизы

Сообщения коммитов — по [Conventional Commits](https://www.conventionalcommits.org/ru/v1.0.0/),
их проверяет commitlint (локально и в CI):

```
<type>(<scope>): <subject>
```

Допустимые типы: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`. Scope необязателен: `feat(backend): ...`,
`feat: ...`. Тема — до 100 символов, регистр не важен.

Примеры:

```
feat(backend): add slots endpoint
fix(frontend): fix timezone in slot picker
docs: explain local setup
ci: run smoke check on pull requests
```

Релизы автоматические: workflow `.github/workflows/release-please.yml` после
merge в `main` читает историю коммитов, собирает CHANGELOG и открывает PR
`chore(main): release backend 0.1.0`. Версии назначаются по SemVer: `feat`
увеличивает минорную, `fix` — патч, `BREAKING CHANGE` — мажорную. После мержа
этого PR появляется GitHub Release с тегом `backend-v0.1.0`.

Единственная настройка на стороне GitHub — в разделе
Settings → Actions → General → Workflow permissions включить _Allow GitHub
Actions to create and approve pull requests_, иначе release-please не сможет
открыть свой PR. Права на запись выдаёт сам workflow через блок
`permissions` (`contents`, `issues`, `pull-requests`), токен дополнительно
не нужен.

## CI

`.github/workflows/ci.yml` гоняет пять проверок: линтер и форматирование,
типы, тесты, сборку и smoke-тест — приложения собираются, поднимаются как
процессы и должны ответить на `/health` (backend) и отдать собранный HTML
(frontend). Отдельно в PR проверяются заголовки коммитов.

Один нюанс: PR, созданный release-please, не запускает CI — события от
`GITHUB_TOKEN` не порождают новых прогонов workflow. На релизном PR
проверки просто не появятся; если понадобится, чтобы запускались, потребуется
PAT в секретах.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
