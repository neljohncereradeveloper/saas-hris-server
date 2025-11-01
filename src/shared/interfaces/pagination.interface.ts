export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startRecord: number;
  endRecord: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
