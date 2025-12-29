import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
  timer,
  expand,
  filter,
  take,
  EMPTY, tap, throwError
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
export class ThumbComponent {
  readonly filePath = input.required<string>();
  readonly filePath$ = toObservable(this.filePath).pipe(distinctUntilChanged());

  readonly rootDirName = input.required<string>();
  readonly rootDirName$ = toObservable(this.rootDirName).pipe(distinctUntilChanged());

  readonly subPath = input.required<string>();
  readonly subPath$ = toObservable(this.subPath).pipe(distinctUntilChanged());

  readonly thumbSize = input.required<ThumbSize>();
  readonly thumbSize$ = toObservable(this.thumbSize).pipe(distinctUntilChanged());

  readonly loaded = output();

  readonly isFetching = signal(false);
  readonly isThumbReady = signal(true);

  readonly isFetchError = signal(false);

  get thumbUrl(): string {
    return this.urlService.getThumbUrl(this.filePath(), this.thumbSize());
  }

  constructor(
    private filesApiService: FilesApiService,
    private matSnackBar: MatSnackBar,
    private urlService: UrlService,
  ) {
    effect(() => {
      // to trigger effect by these signals
      this.filePath();
      this.rootDirName();
      this.subPath();

      this.isFetching.set(false);
      this.isThumbReady.set(true);
      this.isFetchError.set(false);
    });
  }

  checkAndGenerateThumb() {
    const subPath = this.subPath();
    const filePath = this.filePath();
    const rootDirName = this.rootDirName();
    const thumbSize = this.thumbSize();

    this.isFetchError.set(false)
    this.isFetching.set(true);

    this.filesApiService.getCheckThumb({filePath, rootDirName, thumbSize, subPath})
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

  protected readonly onload = onload;
}

