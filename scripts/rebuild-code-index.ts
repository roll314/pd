import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPOSITORY_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_PATH = path.join(REPOSITORY_PATH, 'docs', 'CODE_INDEX.md');

const SOURCE_ROOTS = [
  'pd.client/src',
  'pd.server/config',
  'pd.server/dav',
  'pd.server/db',
  'pd.server/http',
  'pd.server/thumb',
  'pd.server/utils',
  'shared',
  'scripts',
];

const ROOT_FILES = [
  'docker-compose.yml',
  'pd.client/angular.json',
  'pd.client/package.json',
  'pd.client/proxy.docker.conf.json',
  'pd.client/proxy.local.conf.json',
  'pd.client/tsconfig.app.json',
  'pd.client/tsconfig.json',
  'pd.client/tsconfig.spec.json',
  'pd.server/config.json',
  'pd.server/config_docker.json',
  'pd.server/deno.json',
  'pd.server/davServer.ts',
  'pd.server/dockerfile',
  'pd.server/drizzle.config.ts',
  'pd.server/httpServer.ts',
  'pd.server/main.ts',
  'pd.server/main_test.ts',
];

const INDEXED_EXTENSIONS = new Set([
  '.html',
  '.json',
  '.scss',
  '.sql',
  '.ts',
  '.yaml',
  '.yml',
]);

const IGNORED_DIRECTORIES = new Set([
  '.angular',
  '.git',
  '.idea',
  'dist',
  'node_modules',
  'static',
]);

const KEY_FILE_DESCRIPTIONS: Record<string, string> = {
  'pd.client/src/main.ts': 'Точка запуска Angular.',
  'pd.client/src/app/app.routes.ts': 'Маршруты приложения и guards/resolvers.',
  'pd.client/src/app/api/files-api.service.ts': 'HTTP-клиент файлов, каталогов и проверки миниатюр.',
  'pd.client/src/app/features/files/files.component.ts': 'Состояние каталога, пагинация и запуск галереи.',
  'pd.client/src/app/features/files/thumb/thumb.component.ts': 'IntersectionObserver, polling генерации и отмена устаревших запросов.',
  'pd.client/src/app/features/files/thumb/img-loader/image-load-scheduler.service.ts': 'Глобальный лимит параллельных загрузок изображений.',
  'pd.client/src/app/services/storage.service.ts': 'Выбранный root и нормализованный относительный путь.',
  'pd.client/src/app/services/url.service.ts': 'Единая точка построения URL файлов, preview и миниатюр.',
  'pd.server/main.ts': 'Точка запуска HTTP и DAV серверов.',
  'pd.server/http/initHttp.ts': 'Регистрация middleware и HTTP routes.',
  'pd.server/http/routes/getFolderData.ts': 'Чтение, сортировка, кеш и пагинация каталога.',
  'pd.server/http/routes/getThumb.ts': 'Отдача JPEG, ETag и HTTP cache semantics.',
  'pd.server/http/routes/checkThumb.ts': 'Проверка наличия и фоновый запуск генерации.',
  'pd.server/thumb/thumbGenerationJobs.ts': 'Дедупликация и состояние фоновых задач.',
  'pd.server/thumb/getThumbFileHashSource.ts': 'Версионированный ключ файлового кеша.',
  'pd.server/thumb/image/imageThumbGenerator.ts': 'Генерация одного запрошенного размера изображения.',
  'pd.server/thumb/video/videoThumbGenerator.ts': 'Кадр видео и видео-preview для PREVIEW.',
  'pd.server/dav/listeners/afterPUTListener.ts': 'Предварительная генерация GRID/SMALL после загрузки.',
  'shared/thumbSize.ts': 'Общий enum размеров миниатюр.',
  'scripts/rebuild-code-index.ts': 'Генератор этого индекса.',
};

interface IIndexedFile {
  relativePath: string;
  exports: string[];
}

async function collectFiles(relativeDirectory: string): Promise<string[]> {
  const directoryPath = path.join(REPOSITORY_PATH, relativeDirectory);
  const result: string[] = [];

  for await (const entry of Deno.readDir(directoryPath)) {
    if (entry.name.startsWith('.') || IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const relativePath = path.posix.join(relativeDirectory.replaceAll(path.sep, '/'), entry.name);
    if (entry.isDirectory) {
      result.push(...await collectFiles(relativePath));
    } else if (entry.isFile && INDEXED_EXTENSIONS.has(path.extname(entry.name))) {
      result.push(relativePath);
    }
  }

  return result;
}

function extractExports(source: string): string[] {
  const result = new Set<string>();
  const exportPattern = /export\s+(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(?:class|interface|type|enum|function|const|let|var)\s+([A-Za-z_$][\w$]*)/g;

  for (const match of source.matchAll(exportPattern)) {
    result.add(match[1]);
  }

  return [...result].sort((a, b) => a.localeCompare(b, 'en'));
}

async function indexFile(relativePath: string): Promise<IIndexedFile> {
  const filePath = path.join(REPOSITORY_PATH, relativePath);
  const source = await Deno.readTextFile(filePath);

  return {
    relativePath: relativePath.replaceAll(path.sep, '/'),
    exports: path.extname(relativePath) === '.ts' ? extractExports(source) : [],
  };
}

function getSection(relativePath: string): string {
  if (relativePath.startsWith('pd.client/src/app/features/')) return 'Клиент: features';
  if (relativePath.startsWith('pd.client/src/app/api/')) return 'Клиент: API';
  if (relativePath.startsWith('pd.client/src/app/')) return 'Клиент: приложение и инфраструктура';
  if (relativePath.startsWith('pd.client/src/')) return 'Клиент: entrypoint и глобальные стили';
  if (relativePath.startsWith('pd.server/http/')) return 'Сервер: HTTP';
  if (relativePath.startsWith('pd.server/dav/')) return 'Сервер: WebDAV';
  if (relativePath.startsWith('pd.server/thumb/')) return 'Сервер: миниатюры';
  if (relativePath.startsWith('pd.server/db/')) return 'Сервер: база данных';
  if (relativePath.startsWith('pd.server/config/')) return 'Сервер: конфигурация';
  if (relativePath.startsWith('pd.server/utils/')) return 'Сервер: утилиты';
  if (relativePath.startsWith('pd.server/')) return 'Сервер: entrypoints и tooling';
  if (relativePath.startsWith('shared/')) return 'Общий код';
  if (relativePath.startsWith('scripts/')) return 'Инструменты репозитория';
  return 'Корень и окружение';
}

function renderFile(file: IIndexedFile): string {
  const description = KEY_FILE_DESCRIPTIONS[file.relativePath];
  const details: string[] = [];

  if (description) details.push(description);
  if (file.exports.length) {
    details.push(`Экспорты: ${file.exports.map(item => `\`${item}\``).join(', ')}.`);
  }

  const suffix = details.length ? ` — ${details.join(' ')}` : '';
  return `- [\`${file.relativePath}\`](../${file.relativePath})${suffix}`;
}

function renderIndex(files: IIndexedFile[]): string {
  const groupedFiles = new Map<string, IIndexedFile[]>();
  for (const file of files) {
    const section = getSection(file.relativePath);
    const sectionFiles = groupedFiles.get(section) ?? [];
    sectionFiles.push(file);
    groupedFiles.set(section, sectionFiles);
  }

  const sections = [...groupedFiles.entries()]
    .map(([section, sectionFiles]) => [
      `### ${section}`,
      '',
      ...sectionFiles
        .sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'en'))
        .map(renderFile),
      '',
    ].join('\n'))
    .join('\n');

  return `# Индекс кода PD

> Файл сгенерирован автоматически. После любого изменения кода, шаблонов,
> стилей, конфигурации или структуры каталогов пересоберите его командой:
>
> \`deno run --allow-read --allow-write scripts/rebuild-code-index.ts\`
>
> Для проверки без записи используйте:
> \`deno run --allow-read scripts/rebuild-code-index.ts --check\`

## Быстрая навигация по потокам

| Поток | Начинайте отсюда | Затем смотрите |
| --- | --- | --- |
| Запуск сервера | \`pd.server/main.ts\` | \`httpServer.ts\`, \`davServer.ts\` |
| HTTP API | \`pd.server/http/initHttp.ts\` | \`http/middleware/*\`, \`http/routes/*\` |
| Список файлов | \`files.component.ts\` | \`files-api.service.ts\`, \`getFolderData.ts\` |
| Миниатюра в списке | \`thumb.component.ts\` | \`img-loader/*\`, \`getThumb.ts\`, \`checkThumb.ts\` |
| Генерация миниатюры | \`thumbGenerationJobs.ts\` | \`generateThumb.ts\`, image/video generators |
| Загрузка через WebDAV | \`setDavFs.ts\` | \`dav/listeners/afterPUTListener.ts\` |
| Авторизация | \`login.service.ts\` | \`login-api.service.ts\`, \`auth.ts\`, \`authGuard.ts\` |
| Галерея и видео | \`gallery-overlay.component.ts\` | \`video-player.component.ts\`, URL utilities |
| Конфигурация | \`config/getConfig.ts\` | \`config/models.ts\`, \`config/defaultConfig.ts\` |

## Последовательность загрузки миниатюры

\`FilesComponent → FsItemIconComponent → ThumbComponent → ImageLoadSchedulerService → /api/thumb\`

При \`404\`:

\`ThumbComponent → /api/checkThumb → scheduleThumbGeneration → generateThumb → image/video queue → NConvert/FFmpeg\`

После \`202\` клиент опрашивает check endpoint повторно. Выход элемента далеко за
viewport отменяет ожидающую задачу, активный \`<img>\` и polling subscription.

## Полный индекс файлов и экспортов

${sections}`;
}

const relativeFiles = new Set<string>(ROOT_FILES);
for (const sourceRoot of SOURCE_ROOTS) {
  for (const relativePath of await collectFiles(sourceRoot)) {
    relativeFiles.add(relativePath);
  }
}

const indexedFiles = await Promise.all(
  [...relativeFiles]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map(indexFile),
);
const generatedIndex = renderIndex(indexedFiles);
const checkOnly = Deno.args.includes('--check');

if (checkOnly) {
  const currentIndex = await Deno.readTextFile(INDEX_PATH).catch(() => '');
  if (currentIndex !== generatedIndex) {
    console.error('docs/CODE_INDEX.md устарел. Выполните пересборку индекса.');
    Deno.exit(1);
  }

  console.log('docs/CODE_INDEX.md актуален.');
} else {
  await Deno.mkdir(path.dirname(INDEX_PATH), {recursive: true});
  await Deno.writeTextFile(INDEX_PATH, generatedIndex);
  console.log('docs/CODE_INDEX.md пересобран.');
}
