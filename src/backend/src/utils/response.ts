import { Response } from 'express';

/**
 * Standardized API response helpers
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp?: string;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse['meta']
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
  res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number }
): void => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: new Date().toISOString(),
    },
  };
  res.status(200).json(response);
};

export const sendCreated = <T>(res: Response, data: T): void => {
  sendSuccess(res, data, 201);
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  res.status(statusCode).json(response);
};
