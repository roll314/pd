import {RequestListener} from 'npm:webdav-server@2.6.2/lib/server/v2/webDAVServer/BeforeAfter.d.ts';
import {findPhysicalPath} from '../../utils/findPhysicalPath.ts';
import {log, LogLevel, SystemPart} from '../../utils/log.ts';
import { isFileSupported } from '../../../shared/isFileSupported.ts';
import {scheduleThumbGeneration} from '../../thumb/thumbGenerationJobs.ts';
import {ThumbSize} from '../../../shared/thumbSize.ts';

export const afterPUTListener: RequestListener = (arg, next) => {
  if (
    arg.request.method === 'PUT' && arg.response.statusCode >= 200 &&
    arg.response.statusCode < 300
  ) {
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
    const fullFilePath = decodeURIComponent(decodeURI(`${homeDirPhysicalPath}/${relativeFileName}`));

    if (!isFileSupported(fullFilePath)) {
      return next();
    }

    // Для списков заранее нужны только лёгкие варианты. Большой preview создаётся при открытии галереи.
    [ThumbSize.GRID, ThumbSize.SMALL].forEach(thumbSize => {
      scheduleThumbGeneration(fullFilePath, thumbSize)
        .catch((e) =>
          log(`Cannot generate ${thumbSize} thumb for ${fullFilePath}: ${(e as Error).message}`, LogLevel.LOG, SystemPart.DAV)
        );
    });
  }

  next();
};
