import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';

import { axiosConfig } from '../config';

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  response: AxiosResponse<T> | null;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const request = async <T>(
  method: HttpMethod,
  url: string,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await axiosConfig.request({ method, url, ...config });
    return { data: response.data as T, error: null, response };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        data: null,
        error: axiosError.message || 'Unknown error',
        response: axiosError.response as AxiosResponse<T> | null,
      };
    }
    return { data: null, error: 'Неизвестная ошибка', response: null };
  }
};

export const GET = <T>(url: string, config?: AxiosRequestConfig) => request<T>('GET', url, config);

export const POST = <T>(url: string, data?: never, config?: AxiosRequestConfig) =>
  request<T>('POST', url, { ...config, data });

export const PUT = <T>(url: string, data?: never, config?: AxiosRequestConfig) =>
  request<T>('PUT', url, { ...config, data });

export const DELETE = <T>(url: string, config?: AxiosRequestConfig) =>
  request<T>('DELETE', url, config);
