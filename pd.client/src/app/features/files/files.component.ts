import { ChangeDetectionStrategy, Component, computed, Signal, signal, WritableSignal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FilesApiService } from '../../api/files-api.service';
import { catchError, combineLatest, distinctUntilChanged, filter, finalize, map, NEVER, tap } from 'rxjs';
import { RootFoldersRes } from '../../model/api/root-folders-res';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FSItem, FSItemType } from '../../model/api/get-folder-data-res';
import { MatTableModule } from '@angular/material/table';
import { IconsModule } from '../../icons/icons.module';
import { LoginService } from '../../services/login.service';
import { StorageService } from '../../services/storage.service';
import { GalleryItem, GalleryItemType, GalleryOverlayComponent } from '../gallery-overlay/gallery-overlay.component';
import { isGalleryFile } from '../../utils/is-gallery-file';
import { ThumbSize } from '../../../../../shared/thumbSize';
import { toObservable } from '@angular/core/rxjs-interop';
import { getFileType, SupportedFileType } from '../../../../../shared/isFileSupported';
import { TableViewComponent } from './table-view/table-view.component';
import { GridViewComponent } from './grid-view/grid-view.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export enum ViewType {
  TABlE,
  GRID,
}


const SCROLL_THRESHOLD_PX = 100;
const FILES_LIMIT = 500;


@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  imports: [
    CommonModule,
    AsyncPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule,
    GalleryOverlayComponent,
    TableViewComponent,
    GridViewComponent,
    MatSlideToggleModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'layout flex-grow'},
})
export class FilesComponent {
  readonly rootFolders$ = this.filesApiService.getRootFolders()
    .pipe(
      catchError(() => {
        this.matSnackBar.open('Cannot get root folders', undefined, {duration: 3000});
        return NEVER;
      }),
      map((data: RootFoldersRes) => data.rootFolders),
      tap((rootFolders: string[]) => rootFolders.length ? this.selectedRootDir.setValue(rootFolders[0]) : undefined),
    );

  readonly selectedRootDir: FormControl<string> = new FormControl();

  readonly isFirstPageFetching: WritableSignal<boolean> = signal(false);
  readonly isNextPageFetching: WritableSignal<boolean> = signal(false);
  readonly hasNextPage: WritableSignal<boolean> = signal(false);

  readonly ThumbSize = ThumbSize;

  readonly subPathArr = this.storageService.subPathArr;
  readonly subPath = this.storageService.subPath;
  readonly rootDir = this.storageService.rootDir;

  readonly isGalleryShown = signal(false)

  readonly selectedImageId = signal('')

  readonly folderData = signal<FSItem[]>([]);

  readonly galleryItems: Signal<GalleryItem[] | undefined> = computed(() =>
    this.folderData()
      .filter(item => item.type === FSItemType.FILE)
      .filter(item => isGalleryFile(item.name))
      .map(item => ({
        uid: item.uid,
        name: item.name,
        changedAt: item.changedAt,
        type: getFileType(item.name) === SupportedFileType.VIDEO ? GalleryItemType.VIDEO : GalleryItemType.IMAGE,
      }))
  );

  readonly ViewType = ViewType;

  readonly viewType = signal<ViewType>(ViewType.GRID);

  constructor(
    private loginService: LoginService,
    private filesApiService: FilesApiService,
    private matSnackBar: MatSnackBar,
    private storageService: StorageService,
  ) {
    this.selectedRootDir.valueChanges.subscribe(val => this.storageService.rootDir.set(val));

    combineLatest([
      toObservable(this.subPath).pipe(distinctUntilChanged()),
      toObservable(this.rootDir).pipe(distinctUntilChanged())
    ])
      .pipe(
        filter(([subPath, rootDir]) => !!subPath.length && !!rootDir),
      )
      .subscribe(() => {
        this.fetchFirstPage();
      });
  }

  onItemClick(item: FSItem) {
    if (item.type === FSItemType.FOLDER) {
      this.subPathArr.update(value => [...value, item.name]);
    } else {
      if (!isGalleryFile(item.name)) {
        return;
      }
      this.selectedImageId.set(item.uid);
      this.isGalleryShown.set(true);
    }
  }

  goToSubPath(index: number) {
    this.subPathArr.update(value => value.slice(0, index + 1));
  }

  goUp() {
    this.subPathArr.update(value => value.slice(0, -1));
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;

    const scrollPosition = target.scrollTop + target.clientHeight;
    const scrollHeight = target.scrollHeight;

    const nearByBottom = scrollPosition + SCROLL_THRESHOLD_PX >= scrollHeight;
    const shouldFetchNextPage = !this.isNextPageFetching() &&
      this.hasNextPage() &&
      nearByBottom;

    if (shouldFetchNextPage) {
      this.fetchNextPage();
    }
  }

  private fetchFirstPage() {
    this.folderData.set([]);
    this.isFirstPageFetching.set(true);

    const folderName = this.selectedRootDir.value;
    const subPath = this.subPath();

    const offset = 0;
    const limit = FILES_LIMIT;

    this.filesApiService.getFolderData({folderName, subPath, offset, limit})
      .pipe(
        finalize(() => this.isFirstPageFetching.set(false)),
        catchError(() => {
          this.matSnackBar.open('Cannot get folder data', undefined, {duration: 3000});
          return NEVER;
        }),
      )
      .subscribe(res => {
        this.hasNextPage.set(res.hasNextPage);
        this.folderData.update(folderData => [...folderData, ...res.data]);
      });
  }

  private fetchNextPage() {
    this.isNextPageFetching.set(true);

    const folderName = this.selectedRootDir.value;
    const subPath = this.subPath();

    const offset = this.folderData().length;
    const limit = FILES_LIMIT;

    this.filesApiService.getFolderData({folderName, subPath, offset, limit})
      .pipe(
        finalize(() => this.isNextPageFetching.set(false)),
        catchError(() => {
          this.matSnackBar.open('Cannot get folder data', undefined, {duration: 3000});
          return NEVER;
        }),
      )
      .subscribe(res => {
        this.hasNextPage.set(res.hasNextPage);
        this.folderData.update(folderData => [...folderData, ...res.data]);
      });
  }
}
