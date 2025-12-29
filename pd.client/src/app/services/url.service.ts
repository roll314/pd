import { FSItem } from '../model/api/get-folder-data-res';
import { getFileUrl } from '../utils/getFileUrl';
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { LoginService } from './login.service';
import { getThumbUrl } from '../utils/getThumbUrl';
import { ThumbSize } from '../../../../shared/thumbSize';
import { getVideoPreviewUrl } from '../utils/getVideoPreviewUrl';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  get session(): string {
    return this.loginService.userSession!;
  }

  constructor(
    private storageService: StorageService,
    private loginService: LoginService,
  ) {
  }

  getFileUrl(itemName: string, download: boolean): string {
    return getFileUrl(itemName, this.storageService.rootDir(), this.storageService.subPath(), this.session, download);
  }

  getThumbUrl(itemName: string, thumbSize: ThumbSize): string {
    return getThumbUrl(itemName, this.storageService.rootDir(), this.storageService.subPath(), thumbSize, this.session);
  }

  getVideoPreviewUrl(itemName: string, thumbSize: ThumbSize): string {
    return getVideoPreviewUrl(itemName, this.storageService.rootDir(), this.storageService.subPath(), thumbSize, this.session);
  }
}
