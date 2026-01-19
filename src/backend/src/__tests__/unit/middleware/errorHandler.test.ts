import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
  asyncHandler,
} from '../../../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: '/api/test',
      method: 'GET',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('Custom Error Classes', () => {
    describe('AppError', () => {
      it('should create an error with status code and message', () => {
        const error = new AppError(400, 'Bad request', 'BAD_REQUEST');

        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Bad request');
        expect(error.code).toBe('BAD_REQUEST');
        expect(error.name).toBe('AppError');
      });

      it('should accept optional details', () => {
        const details = { field: 'email', reason: 'invalid format' };
        const error = new AppError(400, 'Validation failed', 'VALIDATION', details);

        expect(error.details).toEqual(details);
      });
    });

    describe('NotFoundError', () => {
      it('should create a 404 error with resource name', () => {
        const error = new NotFoundError('Device');

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Device not found');
        expect(error.code).toBe('NOT_FOUND');
      });
    });

    describe('ValidationError', () => {
      it('should create a 400 error with message', () => {
        const error = new ValidationError('Invalid input');

        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid input');
        expect(error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('UnauthorizedError', () => {
      it('should create a 401 error with default message', () => {
        const error = new UnauthorizedError();

        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Unauthorized');
        expect(error.code).toBe('UNAUTHORIZED');
      });

      it('should accept custom message', () => {
        const error = new UnauthorizedError('Token expired');

        expect(error.message).toBe('Token expired');
      });
    });

    describe('ForbiddenError', () => {
      it('should create a 403 error with default message', () => {
        const error = new ForbiddenError();

        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('Forbidden');
        expect(error.code).toBe('FORBIDDEN');
      });
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError(400, 'Bad request', 'BAD_REQUEST', { field: 'name' });

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Bad request',
        code: 'BAD_REQUEST',
        details: { field: 'name' },
      });
    });

    it('should handle ZodError correctly', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(0),
      });

      let zodError: ZodError;
      try {
        schema.parse({ email: 'invalid', age: -1 });
      } catch (e) {
        zodError = e as ZodError;
      }

      errorHandler(zodError!, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({ field: expect.any(String), message: expect.any(String) }),
        ]),
      });
    });

    it('should handle NotFoundError correctly', () => {
      const error = new NotFoundError('User');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User not found',
        code: 'NOT_FOUND',
        details: undefined,
      });
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Something went wrong',
        code: 'INTERNAL_ERROR',
      });
    });
  });

  describe('asyncHandler', () => {
    it('should call next with error when async function rejects', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      await new Promise(process.nextTick);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should not call next with error when async function resolves', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);

      wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      await new Promise(process.nextTick);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass request, response and next to wrapped function', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);

      wrappedFn(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });
  });
});
