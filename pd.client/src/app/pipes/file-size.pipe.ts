import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  pure: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number, decimals: number = 2): string {
    if (isNaN(bytes) || bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

    return `${formattedSize} ${sizes[i]}`;
  }
}
