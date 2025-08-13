import { HttpStatus } from '@nestjs/common';

export interface SuccessParams<T = any> {
  message?: string;
  data?: T;
}

export interface ErrorParams {
  message?: string;
  code?: string;
}

export interface CommonResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export const Ok = <T = any>(params: SuccessParams<T> = {}) => ({
  success: true,
  statusCode: HttpStatus.OK,
  message: params.message ?? 'OK',
  data: params.data ?? undefined,
});

export const Created = <T = any>(params: SuccessParams<T> = {}) => ({
  success: true,
  statusCode: HttpStatus.CREATED,
  message: params.message ?? 'Created',
  data: params.data ?? undefined,
});
