import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import {FSItem, FSItemType} from '../../../model/api/get-folder-data-res';
import {ThumbComponent} from '../thumb/thumb.component';
import {IconsModule} from '../../../icons/icons.module';
import { ThumbSize } from '../../../../../../shared/thumbSize';
import { getFileExtension, isFileSupported } from '../../../../../../shared/isFileSupported';


export enum UnsupportedFileType {
  DOC,
  PDF,
  TEXT,
  UNKNOWN
}

@Component({
  selector: 'app-fs-item-icon',
  templateUrl: './fs-item-icon.component.html',
  styleUrls: ['./fs-item-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ThumbComponent,
    IconsModule,
  ]
})
export class FsItemIconComponent {
  readonly rootDir = input.required<string>();
  readonly subPath = input.required<string>();
  readonly thumbSize = input.required<ThumbSize>();

  readonly fsItem = input.required<FSItem>();

  readonly unsupportedIconSize = input(64);
  readonly showUnsupportedNames = input(false);

  readonly FSItemType = FSItemType;

  readonly UnsupportedFileType = UnsupportedFileType;
  readonly loaded = output();

  get isFileSupported(): boolean {
    return isFileSupported(this.fsItem().name);
  }

  get fileType(): UnsupportedFileType {
    const extension = getFileExtension(this.fsItem().name);
    if (extension === null) {
      return UnsupportedFileType.UNKNOWN;
    }

    switch (extension) {
      case 'DOC':
        return UnsupportedFileType.DOC;
      case 'PDF':
        return UnsupportedFileType.PDF;
      case 'TXT':
        return UnsupportedFileType.TEXT;
      default:
        return UnsupportedFileType.UNKNOWN;
    }
  }


  constructor() {
    effect(() => {
      this.fsItem();
      if (!this.isFileSupported) {
        this.loaded.emit();
      }
    });
  }
}
