import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
  timer,
  expand,
  filter,
  take,
  EMPTY,
  tap,
  Subscription,
} from 'rxjs';
import {FilesApiService} from '../../../api/files-api.service';
import {HttpResponse} from '@angular/common/http';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ErrorFileIconComponent} from '../../../icons/error-file-icon.component';
import { ThumbSize } from '../../../../../../shared/thumbSize';
import { ImgLoaderComponent } from './img-loader/img-loader.component';
import { UrlService } from '../../../services/url.service';

const RETRY_GET_THUMB_INTERVAL_MS = 1000;
const START_LOAD_DELAY_MS = 150;
const LOAD_ROOT_MARGIN = '800px 0px';
const KEEP_LOAD_ROOT_MARGIN = '1200px 0px';

@Component({
  selector: 'app-thumb',
  templateUrl: 'thumb.component.html',
  styleUrl: 'thumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatProgressSpinnerModule,
    ErrorFileIconComponent,
    ImgLoaderComponent
  ]
})
export class ThumbComponent implements AfterViewInit, OnDestroy {
  readonly filePath = input.required<string>();
  readonly filePath$ = toObservable(this.filePath).pipe(distinctUntilChanged());

  readonly rootDirName = input.required<string>();
  readonly rootDirName$ = toObservable(this.rootDirName).pipe(distinctUntilChanged());

  readonly subPath = input.required<string>();
  readonly subPath$ = toObservable(this.subPath).pipe(distinctUntilChanged());

  readonly thumbSize = input.required<ThumbSize>();
  readonly thumbSize$ = toObservable(this.thumbSize).pipe(distinctUntilChanged());

  readonly version = input.required<number>();

  readonly loaded = output();

  readonly isFetching = signal(false);
  readonly isThumbReady = signal(true);

  readonly isFetchError = signal(false);
  readonly isNearViewport = signal(false);
  readonly isLoaded = signal(false);
  readonly shouldRender = computed(() => this.isNearViewport() || this.isLoaded());

  private loadObserver: IntersectionObserver | null = null;
  private keepLoadObserver: IntersectionObserver | null = null;
  private startLoadTimerId: number | null = null;
  private checkThumbSubscription: Subscription | null = null;

  get thumbUrl(): string {
    return this.urlService.getThumbUrl(this.filePath(), this.thumbSize(), this.version());
  }

  constructor(
    private filesApiService: FilesApiService,
    private matSnackBar: MatSnackBar,
    private urlService: UrlService,
    private elementRef: ElementRef<HTMLElement>,
  ) {
    effect(() => {
      // to trigger effect by these signals
      this.filePath();
      this.rootDirName();
      this.subPath();
      this.version();

      this.checkThumbSubscription?.unsubscribe();
      this.checkThumbSubscription = null;
      this.isLoaded.set(false);
      this.isFetching.set(false);
      this.isThumbReady.set(true);
      this.isFetchError.set(false);
    });
  }

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined') {
      this.isNearViewport.set(true);
      return;
    }

    this.loadObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.activateAfterDelay();
      } else {
        this.cancelStartTimer();
      }
    }, {rootMargin: LOAD_ROOT_MARGIN});

    // Увеличенная внешняя зона не даёт отменять запрос на самой границе viewport.
    this.keepLoadObserver = new IntersectionObserver(entries => {
      if (entries.every(entry => !entry.isIntersecting) && !this.isLoaded()) {
        this.deactivate();
      }
    }, {rootMargin: KEEP_LOAD_ROOT_MARGIN});

    this.loadObserver.observe(this.elementRef.nativeElement);
    this.keepLoadObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.loadObserver?.disconnect();
    this.keepLoadObserver?.disconnect();
    this.deactivate();
  }

  checkAndGenerateThumb() {
    if (this.isFetching()) {
      return;
    }

    const subPath = this.subPath();
    const filePath = this.filePath();
    const rootDirName = this.rootDirName();
    const thumbSize = this.thumbSize();

    this.isFetchError.set(false)
    this.isFetching.set(true);

    this.checkThumbSubscription?.unsubscribe();
    this.checkThumbSubscription = this.filesApiService.getCheckThumb({filePath, rootDirName, thumbSize, subPath})
      .pipe(
        expand((res: HttpResponse<void> | null) => {
          if (!res || !res.status) {
            return EMPTY;
          }

          if (res.status === 202) {
            return timer(RETRY_GET_THUMB_INTERVAL_MS).pipe(
              switchMap(() =>
                this.filesApiService.getCheckThumb({filePath, rootDirName, thumbSize, subPath})
              )
            );
          }

          return EMPTY;
        }),
        filter((res): res is HttpResponse<void> => !!res && res.status === 200),
        take(1), // только первое удачное значение
        tap(() => this.isThumbReady.set(true)),
        catchError(() => {
          this.matSnackBar.open('Error checking preview', undefined, { duration: 1500 });
          this.isFetchError.set(true);
          return of(null);
        }),
        finalize(() => this.isFetching.set(false))
      )
      .subscribe(() => {});
  }

  onFetchThumbError() {
    this.isThumbReady.set(false);
    this.checkAndGenerateThumb();
  }

  onLoaded() {
    this.isLoaded.set(true);
    this.loaded.emit();
  }

  private activateAfterDelay() {
    if (this.isNearViewport() || this.startLoadTimerId !== null) {
      return;
    }

    // Небольшая задержка отбрасывает элементы, которые только мелькнули при быстром скролле.
    this.startLoadTimerId = window.setTimeout(() => {
      this.startLoadTimerId = null;
      this.isNearViewport.set(true);

      if (!this.isThumbReady() && !this.isFetching()) {
        this.checkAndGenerateThumb();
      }
    }, START_LOAD_DELAY_MS);
  }

  private deactivate() {
    this.cancelStartTimer();
    this.isNearViewport.set(false);
    this.checkThumbSubscription?.unsubscribe();
    this.checkThumbSubscription = null;
  }

  private cancelStartTimer() {
    if (this.startLoadTimerId !== null) {
      clearTimeout(this.startLoadTimerId);
      this.startLoadTimerId = null;
    }
  }

}

