import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FSItem, FSItemType } from '../../../model/api/get-folder-data-res';
import { ThumbSize } from '../../../../../../shared/thumbSize';
import { UrlService } from '../../../services/url.service';
import { FsItemIconComponent } from '../fs-item-icon/fs-item-icon.component';

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FsItemIconComponent
  ]
})
export class GridViewComponent {
  readonly rootDir = input.required<string>();
  readonly subPath = input.required<string>();
  readonly folderData = input.required<FSItem[]>();

  readonly itemClick = output<FSItem>();

  readonly FSItemType = FSItemType;
  readonly ThumbSize = ThumbSize;

  constructor(
    private urlService: UrlService,
  ) {
  }
}
