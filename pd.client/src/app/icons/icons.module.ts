import {NgModule} from '@angular/core';
import {DownloadIconComponent} from './download-icon.component';
import {FolderIconComponent} from './folder-icon.component';
import {DocIconComponent} from './doc-icon.component';
import {PdfIconComponent} from './pdf-icon.component';
import {TextIconComponent} from './text-icon.component';
import {UnknownIconComponent} from './unknown-file-icon.component';
import {UpIconComponent} from './up-icon.component';
import {ErrorFileIconComponent} from './error-file-icon.component';
import { CloseIconComponent } from './close-icon.component';
import { PauseIconComponent } from './pause-icon.component';
import { PlayIconComponent } from './play-icon.component';
import { SpeakerIconComponent } from './speaker-icon.component';

const components = [
  DownloadIconComponent,
  FolderIconComponent,
  DocIconComponent,
  PdfIconComponent,
  TextIconComponent,
  UnknownIconComponent,
  UpIconComponent,
  ErrorFileIconComponent,
  CloseIconComponent,
  PauseIconComponent,
  PlayIconComponent,
  SpeakerIconComponent,
];

@NgModule({
  imports: [...components],
  exports: [...components]
})
export class IconsModule {}
