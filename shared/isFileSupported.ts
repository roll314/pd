export enum SupportedFileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

export enum NotSupportedFileType {
  NOT_SUPPORTED = 'NOT_SUPPORTED',
}

export type FileType = SupportedFileType | NotSupportedFileType;

export type SupportMap = {
  [fileType in SupportedFileType]: SupportMapItem;
};

export interface SupportMapItem {
  supportedExtensions: string[];
}

export const supportMap: SupportMap = {
  [SupportedFileType.IMAGE]: {
    supportedExtensions: ['JPEG', 'JPG', 'PNG', 'WEBP', 'AVIF', 'GIF'],
  },
  [SupportedFileType.VIDEO]: {
    supportedExtensions: ['MP4'],
  },
  [SupportedFileType.DOCUMENT]: {
    supportedExtensions: [],
  },
};

export function isFileSupported(filename: string): boolean {
  return getFileType(filename) !== NotSupportedFileType.NOT_SUPPORTED;
}

export function getFileExtension(filename: string): string | null {
  if (typeof filename === 'undefined' || filename === null) {
    return null;
  }

  /*if (filename.startsWith('.')) {
    return null;
  }*/

  const index = filename.lastIndexOf('.');
  if (index < 0) {
    return null;
  }

  return filename.toUpperCase().substring(index + 1);
}

export function getFileType(filename: string): FileType {
  const extension = getFileExtension(filename);
  if (extension === null) {
    return NotSupportedFileType.NOT_SUPPORTED;
  }

  const foundFileType = Object.keys(supportMap).find((key) => {
    const castedKey = key as SupportedFileType;
    return !!supportMap[castedKey]?.supportedExtensions.find((ext) =>
      ext === extension
    );
  });

  return foundFileType as FileType ?? NotSupportedFileType.NOT_SUPPORTED;
}
