export type ApiRequestOptions = RequestInit & {
  token?: string | null;
  searchParams?: URLSearchParams;
};
