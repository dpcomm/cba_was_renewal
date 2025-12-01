export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: any;
}
