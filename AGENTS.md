# Инструкции для агентов

Этот файл действует для всего репозитория. Перед работой прочитайте его и
[`docs/CODE_INDEX.md`](docs/CODE_INDEX.md).

## Обязательный порядок работы

1. Проверьте `git status` и отделите изменения пользователя от своих.
2. Для массового шума из-за CRLF/LF используйте также
   `git diff --ignore-space-at-eol`. Не нормализуйте посторонние файлы.
3. Найдите затрагиваемый поток в `docs/CODE_INDEX.md`, затем читайте реализацию.
4. Сохраняйте стиль ближайшего кода и существующие архитектурные границы.
5. После любого изменения исходного кода, шаблонов, стилей, конфигурации или
   структуры каталогов **обязательно пересоберите индекс кода**:

   ```bash
   deno run --allow-read --allow-write scripts/rebuild-code-index.ts
   ```

   Из каталога `pd.server` можно выполнить `deno task code_index`.
6. Перед передачей результата выполните подходящие проверки из раздела ниже.

Проверить, что индекс актуален, не изменяя его:

```bash
deno run --allow-read scripts/rebuild-code-index.ts --check
```

## Назначение и архитектура

PD — файловая галерея и WebDAV-сервер:

- `pd.client` — Angular 20, standalone-компоненты, signals и RxJS;
- `pd.server` — Deno 2.4, Oak HTTP API, `webdav-server`, PostgreSQL/Drizzle;
- `shared` — модели, которые импортируют и клиент, и сервер;
- `docker-compose.yml` — dev/prod окружения клиента, сервера и PostgreSQL.

HTTP-сервер отдаёт Angular SPA и `/api/*`. DAV-сервер работает отдельно. Порты,
пути к данным, NConvert/FFmpeg и каталог миниатюр берутся из конфигурации и env.
Не зашивайте физические пути или адреса среды в исходники.

Для Deno 2.4 используйте Oak не ниже 17.2.0. Oak 17.1.4 ошибочно принимал Deno
за Node.js из-за глобальных `process` и `global`, выбирал plain HTTP Node-adapter
вместо native TLS и делал HTTPS-порт недоступным.

## Поток миниатюр и важные инварианты

1. Клиент строит URL миниатюры через `UrlService` и добавляет `changedAt` как
   версию URL для браузерного cache busting.
2. `ThumbComponent` использует `IntersectionObserver`: запросы создаются только
   около viewport, при быстром скролле таймеры, `<img>` и HTTP polling отменяются.
3. `ImageLoadSchedulerService` допускает не более шести активных `<img>`.
4. Если `/api/thumb` отвечает `404`, клиент вызывает `/api/checkThumb` и повторяет
   проверку после `202`.
5. Сервер дедуплицирует генерацию по исходному файлу и размеру. Генератор обязан
   создавать только запрошенный `ThumbSize`.
6. `GRID` использует `gridThumbSizePx`, а не размер полноэкранного preview.
7. Ключ серверного кеша учитывает версию формата, путь, `ThumbSize`, mtime, ctime
   и размер исходника. При изменении схемы ключа увеличивайте
   `THUMB_CACHE_VERSION`.
8. `/api/thumb` поддерживает quoted ETag, `If-None-Match`, `304`, `Content-Type`,
   `Content-Length` и приватный immutable browser cache.
9. Lock-файл генератора создаётся атомарно. Не возвращайте асинхронный `touch`
   без ожидания — это снова откроет гонку генераторов.

После изменения версии кеша старые миниатюры становятся недоступны по новому
ключу, но автоматически с диска не удаляются. Не удаляйте каталог кеша без
явного запроса владельца.

## Стиль и ограничения

- Имена сущностей и существующие сообщения логов оставляйте в стиле автора.
- Для неочевидной конкурентной, cache- и cancellation-логики пишите короткие
  комментарии на русском.
- На клиенте предпочитайте signals, `OnPush` и локальные standalone imports.
- В HTTP URL используйте `URLSearchParams`; не склеивайте пользовательские пути
  строковой интерполяцией.
- Не добавляйте в документацию или код логины, пароли, cookies, содержимое `.env`,
  приватные ключи и иные секреты. Уже существующие `server.key` и `.env` нельзя
  выводить в отчёты или менять без отдельного запроса.
- Не редактируйте сгенерированный блок `docs/CODE_INDEX.md` вручную — меняйте
  генератор или код и пересобирайте индекс.

## Проверка

Клиент:

```bash
cd pd.client
yarn install --frozen-lockfile
yarn build
yarn test --watch=false --browsers=ChromeHeadless
```

Если Yarn недоступен, допустим локальный fallback без изменения lock-файла:

```bash
npm install --ignore-scripts --no-package-lock --legacy-peer-deps
npm run build
```

Сервер (версия из Docker-конфигурации — Deno 2.4):

```bash
cd pd.server
deno check main.ts
deno test --allow-read --allow-write
```

Известные особенности текущего baseline:

- production build клиента проходит с предупреждением о превышении initial
  bundle budget;
- старые тесты `app.spec.ts` требуют настройки `HttpClient` provider и могут
  падать независимо от тестов миниатюр;
- Deno lint сообщает `no-import-prefix` для существующих inline `npm:` imports.

Итоговая проверка актуальности индекса:

```bash
deno run --allow-read scripts/rebuild-code-index.ts --check
```
