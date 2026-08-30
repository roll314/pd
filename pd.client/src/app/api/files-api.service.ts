import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RootFoldersRes} from '../model/api/root-folders-res';
import {GetFolderDataRes} from '../model/api/get-folder-data-res';
import {GetFolderDataReq} from '../model/api/get-folder-data-req';
import {GetCheckThumbReq} from '../model/api/get-check-thumb-req';

@Injectable({
  providedIn: 'root'
})
export class FilesApiService {
  constructor(
    private http: HttpClient,
  ) {
  }

  getRootFolders(): Observable<RootFoldersRes> {
    return this.http.get<RootFoldersRes>('/api/rootFolders');
  }

  getFolderData(req: GetFolderDataReq): Observable<GetFolderDataRes> {
    const params: Record<string, string> = {
      ...req,
      offset: req.offset.toString(),
      limit: req.limit.toString(),
  }
    return this.http.get<GetFolderDataRes>('/api/folderData', {params}, );
  }

  getCheckThumb(req: GetCheckThumbReq): Observable<HttpResponse<void>> {
    const params: Record<string, string> = {...req};
    return this.http.get<void>('/api/checkThumb', {params, observe: 'response' });
  }
}
