export interface ApiResponse<T, E = unknown> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  error?: E;
}

export const ok = <T>(data: T, message = 'ok', statusCode = 200): ApiResponse<T> => ({
  success: true,
  statusCode,
  message,
  data,
});

export const fail = <E = unknown>(
  message = 'error',
  error?: E,
  statusCode = 500,
): ApiResponse<null, E> => ({
  success: false,
  statusCode,
  message,
  error,
});
