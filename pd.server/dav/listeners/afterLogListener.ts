import {RequestListener} from 'npm:webdav-server@2.6.2/lib/server/v2/webDAVServer/BeforeAfter.d.ts';
import {getConfig} from '../../config/getConfig.ts';
import {DavLogLevel} from '../logLevel.ts';
import {log, LogLevel, SystemPart} from '../../utils/log.ts';

export const afterLogListener: RequestListener = (arg, next) => {
  const config = getConfig();

  const logLevel = config.davServer.logLevel;
  switch (logLevel) {
    case DavLogLevel.NONE:
      break;
    case DavLogLevel.REQUEST:
      log(
        `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} ${arg.response.statusMessage}`,
        LogLevel.LOG,
        SystemPart.DAV,
      );
      break;
    case DavLogLevel.REQUEST_AND_BODY:
      log(
        `>> ${arg.request.method} ${arg.requested.uri} > ${arg.response.statusCode} ${arg.response.statusMessage}`,
        LogLevel.LOG,
        SystemPart.DAV,
      );
      log(
        arg.responseBody ? arg.responseBody : "no response body",
        LogLevel.LOG,
        SystemPart.DAV,
      );
      break;
  }

  next();
};
