# Индекс кода PD

> Файл сгенерирован автоматически. После любого изменения кода, шаблонов,
> стилей, конфигурации или структуры каталогов пересоберите его командой:
>
> `deno run --allow-read --allow-write scripts/rebuild-code-index.ts`
>
> Для проверки без записи используйте:
> `deno run --allow-read scripts/rebuild-code-index.ts --check`

## Быстрая навигация по потокам

| Поток | Начинайте отсюда | Затем смотрите |
| --- | --- | --- |
| Запуск сервера | `pd.server/main.ts` | `httpServer.ts`, `davServer.ts` |
| HTTP API | `pd.server/http/initHttp.ts` | `http/middleware/*`, `http/routes/*` |
| Список файлов | `files.component.ts` | `files-api.service.ts`, `getFolderData.ts` |
| Миниатюра в списке | `thumb.component.ts` | `img-loader/*`, `getThumb.ts`, `checkThumb.ts` |
| Генерация миниатюры | `thumbGenerationJobs.ts` | `generateThumb.ts`, image/video generators |
| Загрузка через WebDAV | `setDavFs.ts` | `dav/listeners/afterPUTListener.ts` |
| Авторизация | `login.service.ts` | `login-api.service.ts`, `auth.ts`, `authGuard.ts` |
| Галерея и видео | `gallery-overlay.component.ts` | `video-player.component.ts`, URL utilities |
| Конфигурация | `config/getConfig.ts` | `config/models.ts`, `config/defaultConfig.ts` |

## Последовательность загрузки миниатюры

`FilesComponent → FsItemIconComponent → ThumbComponent → ImageLoadSchedulerService → /api/thumb`

При `404`:

`ThumbComponent → /api/checkThumb → scheduleThumbGeneration → generateThumb → image/video queue → NConvert/FFmpeg`

После `202` клиент опрашивает check endpoint повторно. Выход элемента далеко за
viewport отменяет ожидающую задачу, активный `<img>` и polling subscription.

## Полный индекс файлов и экспортов

### Корень и окружение

- [`docker-compose.yml`](../docker-compose.yml)
- [`pd.client/angular.json`](../pd.client/angular.json)
- [`pd.client/package.json`](../pd.client/package.json)
- [`pd.client/proxy.docker.conf.json`](../pd.client/proxy.docker.conf.json)
- [`pd.client/proxy.local.conf.json`](../pd.client/proxy.local.conf.json)
- [`pd.client/tsconfig.app.json`](../pd.client/tsconfig.app.json)
- [`pd.client/tsconfig.json`](../pd.client/tsconfig.json)
- [`pd.client/tsconfig.spec.json`](../pd.client/tsconfig.spec.json)

### Клиент: API

- [`pd.client/src/app/api/files-api.service.ts`](../pd.client/src/app/api/files-api.service.ts) — HTTP-клиент файлов, каталогов и проверки миниатюр. Экспорты: `FilesApiService`.
- [`pd.client/src/app/api/login-api.service.ts`](../pd.client/src/app/api/login-api.service.ts) — Экспорты: `LoginApiService`.

### Клиент: приложение и инфраструктура

- [`pd.client/src/app/app.config.ts`](../pd.client/src/app/app.config.ts) — Экспорты: `appConfig`.
- [`pd.client/src/app/app.html`](../pd.client/src/app/app.html)
- [`pd.client/src/app/app.routes.ts`](../pd.client/src/app/app.routes.ts) — Маршруты приложения и guards/resolvers. Экспорты: `routes`.
- [`pd.client/src/app/app.scss`](../pd.client/src/app/app.scss)
- [`pd.client/src/app/app.spec.ts`](../pd.client/src/app/app.spec.ts)
- [`pd.client/src/app/app.ts`](../pd.client/src/app/app.ts) — Экспорты: `App`.
- [`pd.client/src/app/guards/authenticated.guard.service.ts`](../pd.client/src/app/guards/authenticated.guard.service.ts) — Экспорты: `AuthenticatedGuardService`.
- [`pd.client/src/app/guards/not-authenticated.guard.service.ts`](../pd.client/src/app/guards/not-authenticated.guard.service.ts) — Экспорты: `NotAuthenticatedGuardService`.
- [`pd.client/src/app/icons/chevron-left-icon.component.ts`](../pd.client/src/app/icons/chevron-left-icon.component.ts) — Экспорты: `ChevronLeftIconComponent`.
- [`pd.client/src/app/icons/chevron-right-icon.component.ts`](../pd.client/src/app/icons/chevron-right-icon.component.ts) — Экспорты: `ChevronRightIconComponent`.
- [`pd.client/src/app/icons/close-icon.component.ts`](../pd.client/src/app/icons/close-icon.component.ts) — Экспорты: `CloseIconComponent`.
- [`pd.client/src/app/icons/doc-icon.component.ts`](../pd.client/src/app/icons/doc-icon.component.ts) — Экспорты: `DocIconComponent`.
- [`pd.client/src/app/icons/download-icon.component.ts`](../pd.client/src/app/icons/download-icon.component.ts) — Экспорты: `DownloadIconComponent`.
- [`pd.client/src/app/icons/error-file-icon.component.ts`](../pd.client/src/app/icons/error-file-icon.component.ts) — Экспорты: `ErrorFileIconComponent`.
- [`pd.client/src/app/icons/folder-icon.component.ts`](../pd.client/src/app/icons/folder-icon.component.ts) — Экспорты: `FolderIconComponent`.
- [`pd.client/src/app/icons/icons.module.ts`](../pd.client/src/app/icons/icons.module.ts) — Экспорты: `IconsModule`.
- [`pd.client/src/app/icons/pause-icon.component.ts`](../pd.client/src/app/icons/pause-icon.component.ts) — Экспорты: `PauseIconComponent`.
- [`pd.client/src/app/icons/pdf-icon.component.ts`](../pd.client/src/app/icons/pdf-icon.component.ts) — Экспорты: `PdfIconComponent`.
- [`pd.client/src/app/icons/play-icon.component.ts`](../pd.client/src/app/icons/play-icon.component.ts) — Экспорты: `PlayIconComponent`.
- [`pd.client/src/app/icons/speaker-icon.component.ts`](../pd.client/src/app/icons/speaker-icon.component.ts) — Экспорты: `SpeakerIconComponent`.
- [`pd.client/src/app/icons/text-icon.component.ts`](../pd.client/src/app/icons/text-icon.component.ts) — Экспорты: `TextIconComponent`.
- [`pd.client/src/app/icons/unknown-file-icon.component.ts`](../pd.client/src/app/icons/unknown-file-icon.component.ts) — Экспорты: `UnknownIconComponent`.
- [`pd.client/src/app/icons/up-icon.component.ts`](../pd.client/src/app/icons/up-icon.component.ts) — Экспорты: `UpIconComponent`.
- [`pd.client/src/app/interceptors/not-auth-interceptor.ts`](../pd.client/src/app/interceptors/not-auth-interceptor.ts) — Экспорты: `NotAuthSessionInterceptor`.
- [`pd.client/src/app/model/api/auth-req.ts`](../pd.client/src/app/model/api/auth-req.ts) — Экспорты: `AuthReq`.
- [`pd.client/src/app/model/api/auth-res.ts`](../pd.client/src/app/model/api/auth-res.ts) — Экспорты: `AuthRes`.
- [`pd.client/src/app/model/api/get-check-thumb-req.ts`](../pd.client/src/app/model/api/get-check-thumb-req.ts) — Экспорты: `GetCheckThumbReq`.
- [`pd.client/src/app/model/api/get-folder-data-req.ts`](../pd.client/src/app/model/api/get-folder-data-req.ts) — Экспорты: `GetFolderDataReq`.
- [`pd.client/src/app/model/api/get-folder-data-res.ts`](../pd.client/src/app/model/api/get-folder-data-res.ts) — Экспорты: `FSItem`, `FSItemType`, `GetFolderDataRes`.
- [`pd.client/src/app/model/api/root-folders-res.ts`](../pd.client/src/app/model/api/root-folders-res.ts) — Экспорты: `RootFoldersRes`.
- [`pd.client/src/app/model/api/user.ts`](../pd.client/src/app/model/api/user.ts) — Экспорты: `User`.
- [`pd.client/src/app/model/api/userSession.ts`](../pd.client/src/app/model/api/userSession.ts) — Экспорты: `UserSession`.
- [`pd.client/src/app/pipes/file-size.pipe.ts`](../pd.client/src/app/pipes/file-size.pipe.ts) — Экспорты: `FileSizePipe`.
- [`pd.client/src/app/redirect.component.ts`](../pd.client/src/app/redirect.component.ts) — Экспорты: `RedirectComponent`.
- [`pd.client/src/app/route-resolvers/user-session-info-resolver.ts`](../pd.client/src/app/route-resolvers/user-session-info-resolver.ts) — Экспорты: `UserSessionInfoResolver`.
- [`pd.client/src/app/services/login.service.ts`](../pd.client/src/app/services/login.service.ts) — Экспорты: `LoginService`.
- [`pd.client/src/app/services/storage.service.ts`](../pd.client/src/app/services/storage.service.ts) — Выбранный root и нормализованный относительный путь. Экспорты: `StorageService`.
- [`pd.client/src/app/services/url.service.ts`](../pd.client/src/app/services/url.service.ts) — Единая точка построения URL файлов, preview и миниатюр. Экспорты: `UrlService`.
- [`pd.client/src/app/services/user-session-store.service.ts`](../pd.client/src/app/services/user-session-store.service.ts) — Экспорты: `User`, `UserSessionInfo`, `UserSessionStoreService`.
- [`pd.client/src/app/utils/as-observable-value.ts`](../pd.client/src/app/utils/as-observable-value.ts) — Экспорты: `asObservableValue`, `ObservableValue`.
- [`pd.client/src/app/utils/getFileUrl.ts`](../pd.client/src/app/utils/getFileUrl.ts) — Экспорты: `getFileUrl`.
- [`pd.client/src/app/utils/getThumbUrl.spec.ts`](../pd.client/src/app/utils/getThumbUrl.spec.ts)
- [`pd.client/src/app/utils/getThumbUrl.ts`](../pd.client/src/app/utils/getThumbUrl.ts) — Экспорты: `getThumbUrl`.
- [`pd.client/src/app/utils/getVideoPreviewUrl.ts`](../pd.client/src/app/utils/getVideoPreviewUrl.ts) — Экспорты: `getVideoPreviewUrl`.
- [`pd.client/src/app/utils/is-gallery-file.ts`](../pd.client/src/app/utils/is-gallery-file.ts) — Экспорты: `isGalleryFile`.

### Клиент: features

- [`pd.client/src/app/features/common-header/common-header.component.html`](../pd.client/src/app/features/common-header/common-header.component.html)
- [`pd.client/src/app/features/common-header/common-header.component.scss`](../pd.client/src/app/features/common-header/common-header.component.scss)
- [`pd.client/src/app/features/common-header/common-header.component.ts`](../pd.client/src/app/features/common-header/common-header.component.ts) — Экспорты: `CommonHeaderComponent`.
- [`pd.client/src/app/features/files/files.component.html`](../pd.client/src/app/features/files/files.component.html)
- [`pd.client/src/app/features/files/files.component.scss`](../pd.client/src/app/features/files/files.component.scss)
- [`pd.client/src/app/features/files/files.component.ts`](../pd.client/src/app/features/files/files.component.ts) — Состояние каталога, пагинация и запуск галереи. Экспорты: `FilesComponent`, `ViewType`.
- [`pd.client/src/app/features/files/files.module.ts`](../pd.client/src/app/features/files/files.module.ts) — Экспорты: `FilesModule`.
- [`pd.client/src/app/features/files/fs-item-icon/fs-item-icon.component.html`](../pd.client/src/app/features/files/fs-item-icon/fs-item-icon.component.html)
- [`pd.client/src/app/features/files/fs-item-icon/fs-item-icon.component.scss`](../pd.client/src/app/features/files/fs-item-icon/fs-item-icon.component.scss)
- [`pd.client/src/app/features/files/fs-item-icon/fs-item-icon.component.ts`](../pd.client/src/app/features/files/fs-item-icon/fs-item-icon.component.ts) — Экспорты: `FsItemIconComponent`, `UnsupportedFileType`.
- [`pd.client/src/app/features/files/grid-view/grid-view.component.html`](../pd.client/src/app/features/files/grid-view/grid-view.component.html)
- [`pd.client/src/app/features/files/grid-view/grid-view.component.scss`](../pd.client/src/app/features/files/grid-view/grid-view.component.scss)
- [`pd.client/src/app/features/files/grid-view/grid-view.component.ts`](../pd.client/src/app/features/files/grid-view/grid-view.component.ts) — Экспорты: `GridViewComponent`.
- [`pd.client/src/app/features/files/table-view/table-view.component.html`](../pd.client/src/app/features/files/table-view/table-view.component.html)
- [`pd.client/src/app/features/files/table-view/table-view.component.scss`](../pd.client/src/app/features/files/table-view/table-view.component.scss)
- [`pd.client/src/app/features/files/table-view/table-view.component.ts`](../pd.client/src/app/features/files/table-view/table-view.component.ts) — Экспорты: `TableViewComponent`.
- [`pd.client/src/app/features/files/thumb/img-loader/image-load-scheduler.service.spec.ts`](../pd.client/src/app/features/files/thumb/img-loader/image-load-scheduler.service.spec.ts)
- [`pd.client/src/app/features/files/thumb/img-loader/image-load-scheduler.service.ts`](../pd.client/src/app/features/files/thumb/img-loader/image-load-scheduler.service.ts) — Глобальный лимит параллельных загрузок изображений. Экспорты: `ImageLoadSchedulerService`, `ImageLoadTaskHandle`.
- [`pd.client/src/app/features/files/thumb/img-loader/img-loader.component.html`](../pd.client/src/app/features/files/thumb/img-loader/img-loader.component.html)
- [`pd.client/src/app/features/files/thumb/img-loader/img-loader.component.scss`](../pd.client/src/app/features/files/thumb/img-loader/img-loader.component.scss)
- [`pd.client/src/app/features/files/thumb/img-loader/img-loader.component.ts`](../pd.client/src/app/features/files/thumb/img-loader/img-loader.component.ts) — Экспорты: `ImgLoaderComponent`.
- [`pd.client/src/app/features/files/thumb/thumb.component.html`](../pd.client/src/app/features/files/thumb/thumb.component.html)
- [`pd.client/src/app/features/files/thumb/thumb.component.scss`](../pd.client/src/app/features/files/thumb/thumb.component.scss)
- [`pd.client/src/app/features/files/thumb/thumb.component.ts`](../pd.client/src/app/features/files/thumb/thumb.component.ts) — IntersectionObserver, polling генерации и отмена устаревших запросов. Экспорты: `ThumbComponent`.
- [`pd.client/src/app/features/gallery-overlay/gallery-overlay.component.html`](../pd.client/src/app/features/gallery-overlay/gallery-overlay.component.html)
- [`pd.client/src/app/features/gallery-overlay/gallery-overlay.component.scss`](../pd.client/src/app/features/gallery-overlay/gallery-overlay.component.scss)
- [`pd.client/src/app/features/gallery-overlay/gallery-overlay.component.ts`](../pd.client/src/app/features/gallery-overlay/gallery-overlay.component.ts) — Экспорты: `GalleryItem`, `GalleryItemType`, `GalleryOverlayComponent`.
- [`pd.client/src/app/features/gallery-overlay/video-player/video-player.component.html`](../pd.client/src/app/features/gallery-overlay/video-player/video-player.component.html)
- [`pd.client/src/app/features/gallery-overlay/video-player/video-player.component.scss`](../pd.client/src/app/features/gallery-overlay/video-player/video-player.component.scss)
- [`pd.client/src/app/features/gallery-overlay/video-player/video-player.component.ts`](../pd.client/src/app/features/gallery-overlay/video-player/video-player.component.ts) — Экспорты: `SemiProgress`, `VideoPlayerComponent`.
- [`pd.client/src/app/features/login/login.component.html`](../pd.client/src/app/features/login/login.component.html)
- [`pd.client/src/app/features/login/login.component.scss`](../pd.client/src/app/features/login/login.component.scss)
- [`pd.client/src/app/features/login/login.component.ts`](../pd.client/src/app/features/login/login.component.ts) — Экспорты: `LoginComponent`.

### Клиент: entrypoint и глобальные стили

- [`pd.client/src/index.html`](../pd.client/src/index.html)
- [`pd.client/src/layout.scss`](../pd.client/src/layout.scss)
- [`pd.client/src/main.ts`](../pd.client/src/main.ts) — Точка запуска Angular.
- [`pd.client/src/styles.scss`](../pd.client/src/styles.scss)

### Сервер: entrypoints и tooling

- [`pd.server/config_docker.json`](../pd.server/config_docker.json)
- [`pd.server/config.json`](../pd.server/config.json)
- [`pd.server/davServer.ts`](../pd.server/davServer.ts) — Экспорты: `initDavServer`.
- [`pd.server/deno.json`](../pd.server/deno.json)
- [`pd.server/dockerfile`](../pd.server/dockerfile)
- [`pd.server/drizzle.config.ts`](../pd.server/drizzle.config.ts)
- [`pd.server/httpServer.ts`](../pd.server/httpServer.ts) — Экспорты: `initHttpServer`.
- [`pd.server/main_test.ts`](../pd.server/main_test.ts)
- [`pd.server/main.ts`](../pd.server/main.ts) — Точка запуска HTTP и DAV серверов.

### Сервер: конфигурация

- [`pd.server/config/defaultConfig.ts`](../pd.server/config/defaultConfig.ts) — Экспорты: `defaultConfig`.
- [`pd.server/config/getConfig.ts`](../pd.server/config/getConfig.ts) — Экспорты: `getConfig`.
- [`pd.server/config/models.ts`](../pd.server/config/models.ts) — Экспорты: `IConfig`, `IDavUser`, `IDocumentThumbGeneratorConfig`, `IDotEnvConfig`, `IImageThumbGeneratorConfig`, `IRootDirectory`, `IVideoThumbGeneratorConfig`, `RootDirectoryRole`.

### Сервер: WebDAV

- [`pd.server/dav/createDavUsers.ts`](../pd.server/dav/createDavUsers.ts) — Экспорты: `createDavUsers`, `IDavManagers`.
- [`pd.server/dav/generateThumb.ts`](../pd.server/dav/generateThumb.ts) — Экспорты: `generateThumb`, `GenerateThumbError`.
- [`pd.server/dav/listeners/afterLogListener.ts`](../pd.server/dav/listeners/afterLogListener.ts) — Экспорты: `afterLogListener`.
- [`pd.server/dav/listeners/afterPUTListener.ts`](../pd.server/dav/listeners/afterPUTListener.ts) — Предварительная генерация GRID/SMALL после загрузки. Экспорты: `afterPUTListener`.
- [`pd.server/dav/listeners/beforeDELETEListener.ts`](../pd.server/dav/listeners/beforeDELETEListener.ts) — Экспорты: `beforeDELETEListener`.
- [`pd.server/dav/lockedError.ts`](../pd.server/dav/lockedError.ts) — Экспорты: `LOCKED_ERROR`.
- [`pd.server/dav/logLevel.ts`](../pd.server/dav/logLevel.ts) — Экспорты: `DavLogLevel`.
- [`pd.server/dav/perUserQuotaStorageManager.ts`](../pd.server/dav/perUserQuotaStorageManager.ts) — Экспорты: `PerUserQuotaStorageManager`.
- [`pd.server/dav/setDavFs.ts`](../pd.server/dav/setDavFs.ts) — Экспорты: `setDavFs`, `setRootDirFs`.
- [`pd.server/dav/userManager.ts`](../pd.server/dav/userManager.ts) — Экспорты: `UserManager`.

### Сервер: база данных

- [`pd.server/db/getConnectionString.ts`](../pd.server/db/getConnectionString.ts) — Экспорты: `getConnectionString`.
- [`pd.server/db/migrations/0000_pink_yellowjacket.sql`](../pd.server/db/migrations/0000_pink_yellowjacket.sql)
- [`pd.server/db/migrations/meta/_journal.json`](../pd.server/db/migrations/meta/_journal.json)
- [`pd.server/db/migrations/meta/0000_snapshot.json`](../pd.server/db/migrations/meta/0000_snapshot.json)
- [`pd.server/db/schema.ts`](../pd.server/db/schema.ts) — Экспорты: `albumPhoto`, `albums`, `photos`.

### Сервер: HTTP

- [`pd.server/http/initHttp.ts`](../pd.server/http/initHttp.ts) — Регистрация middleware и HTTP routes. Экспорты: `initHttp`, `IRootFoldersResponse`.
- [`pd.server/http/middleware/authGuard.ts`](../pd.server/http/middleware/authGuard.ts) — Экспорты: `authGuard`.
- [`pd.server/http/middleware/jsonBodyParser.ts`](../pd.server/http/middleware/jsonBodyParser.ts) — Экспорты: `jsonBodyParser`.
- [`pd.server/http/middleware/logger.ts`](../pd.server/http/middleware/logger.ts) — Экспорты: `logger`.
- [`pd.server/http/middleware/queryParser.ts`](../pd.server/http/middleware/queryParser.ts) — Экспорты: `queryParser`.
- [`pd.server/http/middleware/staticFiles.ts`](../pd.server/http/middleware/staticFiles.ts) — Экспорты: `staticFiles`.
- [`pd.server/http/models/commonErrorResponse.ts`](../pd.server/http/models/commonErrorResponse.ts) — Экспорты: `CommonErrorResponse`.
- [`pd.server/http/models/logLevel.ts`](../pd.server/http/models/logLevel.ts) — Экспорты: `HttpLogLevel`.
- [`pd.server/http/routes/auth.ts`](../pd.server/http/routes/auth.ts) — Экспорты: `auth`, `IAuthRequest`, `IAuthResponse`.
- [`pd.server/http/routes/checkThumb.ts`](../pd.server/http/routes/checkThumb.ts) — Проверка наличия и фоновый запуск генерации. Экспорты: `checkThumb`, `ICheckThumbRequest`.
- [`pd.server/http/routes/file.ts`](../pd.server/http/routes/file.ts) — Экспорты: `file`, `IDownloadRequest`.
- [`pd.server/http/routes/getFolderData.ts`](../pd.server/http/routes/getFolderData.ts) — Чтение, сортировка, кеш и пагинация каталога. Экспорты: `FSItemType`, `getFolderData`, `GetFolderDataResponse`, `IFSItemInfo`, `IGetFolderDataRequest`.
- [`pd.server/http/routes/getRootFolders.ts`](../pd.server/http/routes/getRootFolders.ts) — Экспорты: `getDavUser`, `getRootFolders`.
- [`pd.server/http/routes/getThumb.ts`](../pd.server/http/routes/getThumb.ts) — Отдача JPEG, ETag и HTTP cache semantics. Экспорты: `getThumb`, `IGetThumbRequest`.
- [`pd.server/http/routes/logout.ts`](../pd.server/http/routes/logout.ts) — Экспорты: `logout`.
- [`pd.server/http/routes/mySession.ts`](../pd.server/http/routes/mySession.ts) — Экспорты: `mySession`, `MySessionResponse`.
- [`pd.server/http/routes/videoPreview.ts`](../pd.server/http/routes/videoPreview.ts) — Экспорты: `getVideoPreview`, `IGetVideoPreviewRequest`.
- [`pd.server/http/utils/getEtag_test.ts`](../pd.server/http/utils/getEtag_test.ts)
- [`pd.server/http/utils/getEtag.ts`](../pd.server/http/utils/getEtag.ts) — Экспорты: `getEtag`.
- [`pd.server/http/utils/removeAuthCookie.ts`](../pd.server/http/utils/removeAuthCookie.ts) — Экспорты: `removeAuthCookie`.
- [`pd.server/http/utils/userSessions.ts`](../pd.server/http/utils/userSessions.ts) — Экспорты: `addUserSession`, `getUserSessionBySessionToken`, `IUserSession`, `removeExpiredUserSessions`, `removeUserSession`.

### Сервер: миниатюры

- [`pd.server/thumb/document/documentThumbGenerator.ts`](../pd.server/thumb/document/documentThumbGenerator.ts) — Экспорты: `documentThumbGenerator`.
- [`pd.server/thumb/getThumbFileHashSource_test.ts`](../pd.server/thumb/getThumbFileHashSource_test.ts)
- [`pd.server/thumb/getThumbFileHashSource.ts`](../pd.server/thumb/getThumbFileHashSource.ts) — Версионированный ключ файлового кеша. Экспорты: `getThumbFileHashSource`.
- [`pd.server/thumb/getThumbFilePath.ts`](../pd.server/thumb/getThumbFilePath.ts) — Экспорты: `getThumbFilePath`.
- [`pd.server/thumb/getVideoPreviewFilePath.ts`](../pd.server/thumb/getVideoPreviewFilePath.ts) — Экспорты: `getVideoPreviewFilePath`.
- [`pd.server/thumb/image/createImageThumb.ts`](../pd.server/thumb/image/createImageThumb.ts) — Экспорты: `createImageThumb`.
- [`pd.server/thumb/image/imageQueue.ts`](../pd.server/thumb/image/imageQueue.ts) — Экспорты: `getImageQueue`.
- [`pd.server/thumb/image/imageThumbGenerator.ts`](../pd.server/thumb/image/imageThumbGenerator.ts) — Генерация одного запрошенного размера изображения. Экспорты: `imageThumbGenerator`.
- [`pd.server/thumb/isFileExists.ts`](../pd.server/thumb/isFileExists.ts) — Экспорты: `isFileExists`.
- [`pd.server/thumb/models/createThumbResult.ts`](../pd.server/thumb/models/createThumbResult.ts) — Экспорты: `ICreateThumbResult`, `THUMB_FILE_ALREADY_EXISTS_ERROR`.
- [`pd.server/thumb/models/thumbType.ts`](../pd.server/thumb/models/thumbType.ts) — Экспорты: `ThumbType`.
- [`pd.server/thumb/queue.ts`](../pd.server/thumb/queue.ts) — Экспорты: `TaskFn`, `TaskQueue`.
- [`pd.server/thumb/thumbGenerationJobs.ts`](../pd.server/thumb/thumbGenerationJobs.ts) — Дедупликация и состояние фоновых задач. Экспорты: `getThumbGenerationError`, `scheduleThumbGeneration`.
- [`pd.server/thumb/thumbGenerators.ts`](../pd.server/thumb/thumbGenerators.ts) — Экспорты: `IThumbGenerator`, `IThumbGenerators`, `THUMB_GENERATORS`, `ThumbGeneratorConfigMap`.
- [`pd.server/thumb/video/createVideoFrameThumb.ts`](../pd.server/thumb/video/createVideoFrameThumb.ts) — Экспорты: `createVideoFrameThumb`.
- [`pd.server/thumb/video/createVideoPreview.ts`](../pd.server/thumb/video/createVideoPreview.ts) — Экспорты: `createVideoPreview`.
- [`pd.server/thumb/video/videoQueue.ts`](../pd.server/thumb/video/videoQueue.ts) — Экспорты: `getVideoQueue`.
- [`pd.server/thumb/video/videoThumbGenerator.ts`](../pd.server/thumb/video/videoThumbGenerator.ts) — Кадр видео и видео-preview для PREVIEW. Экспорты: `videoThumbGenerator`.

### Сервер: утилиты

- [`pd.server/utils/deepReadonly.ts`](../pd.server/utils/deepReadonly.ts) — Экспорты: `DeepReadonly`, `DeepReadonlyArray`, `DeepReadonlyObject`.
- [`pd.server/utils/dirSize.ts`](../pd.server/utils/dirSize.ts) — Экспорты: `dirSize`.
- [`pd.server/utils/findPhysicalPath.ts`](../pd.server/utils/findPhysicalPath.ts) — Экспорты: `findPhysicalPath`.
- [`pd.server/utils/getArgs.ts`](../pd.server/utils/getArgs.ts) — Экспорты: `getArgs`, `ICliArgs`.
- [`pd.server/utils/hasOneOnfRoles.ts`](../pd.server/utils/hasOneOnfRoles.ts) — Экспорты: `hasOneOfRoles`.
- [`pd.server/utils/log.ts`](../pd.server/utils/log.ts) — Экспорты: `log`, `LogLevel`, `SystemPart`.
- [`pd.server/utils/touch-file.ts`](../pd.server/utils/touch-file.ts) — Экспорты: `touchFile`.
- [`pd.server/utils/without-nested-field.ts`](../pd.server/utils/without-nested-field.ts) — Экспорты: `WithoutNestedField`.

### Инструменты репозитория

- [`scripts/rebuild-code-index.ts`](../scripts/rebuild-code-index.ts) — Генератор этого индекса.

### Общий код

- [`shared/authConst.ts`](../shared/authConst.ts) — Экспорты: `USER_SESSION_COOKIE_KEY`, `USER_SESSION_EXPIRED_AT_COOKIE_KEY`.
- [`shared/isFileSupported.ts`](../shared/isFileSupported.ts) — Экспорты: `FileType`, `getFileExtension`, `getFileType`, `isFileSupported`, `NotSupportedFileType`, `SupportedFileType`, `supportMap`, `SupportMap`, `SupportMapItem`.
- [`shared/thumbSize.ts`](../shared/thumbSize.ts) — Общий enum размеров миниатюр. Экспорты: `ThumbSize`.
