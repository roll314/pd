import { RequestListener } from 'npm:webdav-server@2.6.2/lib/server/v2/webDAVServer/BeforeAfter.d.ts';
import { log, LogLevel, SystemPart } from '../../utils/log.ts';
import { findPhysicalPath } from '../../utils/findPhysicalPath.ts';
import { isFileSupported } from '../../../shared/isFileSupported.ts';
import { getThumbFileHashSource } from '../../thumb/getThumbFileHashSource.ts';
import { ThumbSize } from '../../../shared/thumbSize.ts';
import { getThumbFilePath } from '../../thumb/getThumbFilePath.ts';
import { isFileExists } from '../../thumb/isFileExists.ts';
import fs from 'node:fs/promises';
import { getVideoPreviewFilePath } from '../../thumb/getVideoPreviewFilePath.ts';

export const beforeDELETEListener: RequestListener = (arg, next) => {
  if (arg.request.method === 'DELETE' && isFileSupported(arg.requested.uri)) {
    // in the drive, the URI is of the form /user/homedirname/relative/path/to/folder/and/file
    const pathElements = arg.requested.uri.split('/');
    pathElements.shift(); // first element is always empty !
    const username = pathElements.shift();
    if (!username) {
      log(`Cannot determine username from uri: ${arg.requested.uri}`, LogLevel.LOG, SystemPart.THUMB,);

      return next();
    }
    const homeDirName = pathElements.shift() ?? '/';
    const relativeFileName = pathElements.join('/');
    const homeDirPhysicalPath = findPhysicalPath(username, homeDirName);
    const fullFilename = decodeURIComponent(decodeURI(`${homeDirPhysicalPath}/${relativeFileName}`));

    [
      getThumbFilePath(getThumbFileHashSource(fullFilename, ThumbSize.PREVIEW)),
      getThumbFilePath(getThumbFileHashSource(fullFilename, ThumbSize.SMALL)),
      getThumbFilePath(getThumbFileHashSource(fullFilename, ThumbSize.BIG)),
      getVideoPreviewFilePath(getThumbFileHashSource(fullFilename, ThumbSize.PREVIEW)),
    ].forEach(async thumbFilePath => {
      const isThumbExists = await isFileExists(thumbFilePath);
      if (!isThumbExists) {
        return;
      }

      log(`Deleting thumb ${thumbFilePath}`, LogLevel.LOG, SystemPart.THUMB);
      try {
        await fs.unlink(thumbFilePath);
      } catch (e) {
        log(`Deleting thumb ${thumbFilePath} was failed: ${e}`, LogLevel.ERROR, SystemPart.THUMB);
      }
    });
  }

  next();
}
