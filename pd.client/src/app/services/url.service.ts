import { getFileUrl } from '../utils/getFileUrl';
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { getThumbUrl } from '../utils/getThumbUrl';
import { ThumbSize } from '../../../../shared/thumbSize';
import { getVideoPreviewUrl } from '../utils/getVideoPreviewUrl';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor(
    private storageService: StorageService
  ) {
  }

  getFileUrl(itemName: string, download: boolean): string {
    return getFileUrl(itemName, this.storageService.rootDir(), this.storageService.subPath(), download);
  }

  getThumbUrl(itemName: string, thumbSize: ThumbSize): string {
    return getThumbUrl(itemName, this.storageService.rootDir(), this.storageService.subPath(), thumbSize);
  }

  getVideoPreviewUrl(itemName: string, thumbSize: ThumbSize): string {
    return getVideoPreviewUrl(itemName, this.storageService.rootDir(), this.storageService.subPath(), thumbSize);
  }
}
