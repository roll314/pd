export enum FSItemType {
  FOLDER = "FOLDER",
  FILE = "FILE",
}

export interface FSItem {
  uid: string;
  name: string;
  type: FSItemType;
  size: number;
  changedAt: number;
  createdAt: number;
}

export interface GetFolderDataRes {
  data: FSItem[];
  totalCount: number;
  hasNextPage: boolean;
}
