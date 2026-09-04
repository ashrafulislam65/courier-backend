import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import * as userService from './user.service';


export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.id);
  sendSuccess(res, user, 'Profile fetched successfully');
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateMe(req.user!.id, req.body);
  sendSuccess(res, user, 'Profile updated successfully');
});