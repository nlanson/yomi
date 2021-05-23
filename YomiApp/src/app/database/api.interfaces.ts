export interface MangaData {
  title: string;
  path: string;
  pageCount: string;
  cover: string;
}

export type Status = 'success' | 'failure' | 'error';

export interface CommonAPIResult { //== CommonHandlerResult in Backend.
  status: Status;
  message: string;
  data?: any; //If it exists it could be any type. String, Object or null.
}

export interface CollectionInfo {
  name: string,
  id: string,
  mangas: Array<title>,
  count: number
}

interface title {
  title: string,
  path?: string,
  pageCount: string,
  cover?: string
}
