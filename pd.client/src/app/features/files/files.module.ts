import {NgModule} from '@angular/core';
import {FilesComponent} from './files.component';
import {ThumbComponent} from './thumb/thumb.component';
import {FsItemIconComponent} from './fs-item-icon/fs-item-icon.component';

@NgModule({
  imports: [
    FilesComponent,
    ThumbComponent,
    FsItemIconComponent,
  ]
})
export class FilesModule {}
