export interface ApiResponse<T, E = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: E;
}

export const ok = <T>(data: T, message = 'ok'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const fail = <E = unknown>(
  message = 'error',
  error?: E,
): ApiResponse<null, E> => ({
  success: false,
  message,
  error,
});
