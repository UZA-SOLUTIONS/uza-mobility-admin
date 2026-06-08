export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiErrorBody = {
  code: string;
  message: string;
  statusCode: number;
};

export type ApiError = {
  success: false;
  error: ApiErrorBody;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
