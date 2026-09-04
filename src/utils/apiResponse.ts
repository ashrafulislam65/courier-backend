import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any = {},
  message = 'Operation successful',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500,
  errors: any[] = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};