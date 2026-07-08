export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResult<
  T,
  TMeta extends PaginationMeta = PaginationMeta,
> = {
  items: T[];
  meta: TMeta;
};
