# PD

Файловая галерея с Angular-клиентом, Deno/Oak API и WebDAV-сервером.

- [Инструкции для агентов](AGENTS.md) — архитектура, инварианты, стиль и проверки.
- [Индекс кода](docs/CODE_INDEX.md) — навигация по потокам, файлам и экспортам.
- [Документация клиента](pd.client/README.md) — стандартные команды Angular.

После любых изменений кода, шаблонов, стилей, конфигурации или структуры
каталогов обязательно пересоберите индекс:

```bash
deno run --allow-read --allow-write scripts/rebuild-code-index.ts
```

Проверка актуальности без перезаписи:

```bash
deno run --allow-read scripts/rebuild-code-index.ts --check
```
