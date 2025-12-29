import { getFileExtension } from '../../../../shared/isFileSupported';

const IMAGES_EXTENSIONS: string[] = ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'GIF'];
const VIDEO_EXTENSIONS: string[] = ['MP4'];

const GALLERY_EXTENSIONS = [
  ...IMAGES_EXTENSIONS,
  ...VIDEO_EXTENSIONS
];

export function isGalleryFile(filename: string): boolean {
  const extension = getFileExtension(filename) ?? '';
  return GALLERY_EXTENSIONS.includes(extension);
}
