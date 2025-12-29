import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FSItem, FSItemType } from '../../../model/api/get-folder-data-res';
import { ThumbSize } from '../../../../../../shared/thumbSize';
import { DownloadIconComponent } from '../../../icons/download-icon.component';
import { FsItemIconComponent } from '../fs-item-icon/fs-item-icon.component';
import { UrlService } from '../../../services/url.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { FileSizePipe } from '../../../pipes/file-size.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
  imports: [
    DownloadIconComponent,
    FsItemIconComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    FileSizePipe,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableViewComponent {
  readonly rootDir = input.required<string>();
  readonly subPath = input.required<string>();
  readonly folderData = input.required<FSItem[]>();

  readonly rowClick = output<FSItem>();

  readonly FSItemType = FSItemType;
  readonly ThumbSize = ThumbSize;

  readonly displayedColumns: (keyof FSItem)[] = ['name', 'size', 'changedAt', 'createdAt'];

  constructor(
    private urlService: UrlService,
  ) {
  }

  getFileUrl(item: FSItem, download: boolean): string {
    return this.urlService.getFileUrl(item.name, download);
  }
}
