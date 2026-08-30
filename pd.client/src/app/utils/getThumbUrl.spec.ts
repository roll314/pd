import {ThumbSize} from '../../../../shared/thumbSize';
import {getThumbUrl} from './getThumbUrl';

describe('getThumbUrl', () => {
  it('encodes path parameters and includes the source version', () => {
    const url = getThumbUrl(
      'фото & отпуск #1.jpg',
      'Фото & видео',
      '/Лето 2026',
      ThumbSize.GRID,
      123456,
    );
    const parsedUrl = new URL(url, 'https://localhost');

    expect(parsedUrl.searchParams.get('filePath')).toBe('фото & отпуск #1.jpg');
    expect(parsedUrl.searchParams.get('rootDirName')).toBe('Фото & видео');
    expect(parsedUrl.searchParams.get('subPath')).toBe('/Лето 2026');
    expect(parsedUrl.searchParams.get('thumbSize')).toBe(ThumbSize.GRID);
    expect(parsedUrl.searchParams.get('version')).toBe('123456');
  });
});
