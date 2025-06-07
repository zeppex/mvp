// Api client for making requests to the backend
import apiClient from "./axios-next-auth";

interface ApiResponse<T> {
  data: T;
  status: number;
}

// Common types for request parameters
type QueryParams = Record<string, string | number | boolean | null | undefined>;
type RequestConfig = {
  headers?: Record<string, string>;
  params?: QueryParams;
  [key: string]: any;
};

// API client wrapper for axios
class ApiClient {
  // HTTP methods
  async get<T>(
    endpoint: string,
    params?: QueryParams
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.get<T>(endpoint, { params });
    return {
      data: response.data,
      status: response.status,
    };
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.post<T>(endpoint, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.put<T>(endpoint, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<T>(endpoint, config);
    return {
      data: response.data,
      status: response.status,
    };
  }
}

export const api = new ApiClient();
