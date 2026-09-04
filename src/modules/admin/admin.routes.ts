import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import * as adminService from './admin.service';

const updateRoleSchema = z.object({
  body: z.object({ role: z.enum(['CUSTOMER', 'COURIER', 'ADMIN']) }),
});

const blockUserSchema = z.object({
  body: z.object({ isBlocked: z.boolean() }),
});

const listUsers = catchAsync(async (req: Request, res: Response) => {
  const { role, page, limit } = req.query;
  const result = await adminService.listUsers({
    role: role as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  sendSuccess(res, result, 'Users fetched successfully');
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role, req.user!.id);
  sendSuccess(res, user, 'User role updated successfully');
});

const toggleBlockUser = catchAsync(async (req: Request, res: Response) => {
  const user = await adminService.toggleBlockUser(req.params.id, req.body.isBlocked, req.user!.id);
  sendSuccess(res, user, 'User block status updated successfully');
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats, 'Dashboard stats fetched successfully');
});

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const logs = await adminService.getAuditLogs(page ? Number(page) : undefined, limit ? Number(limit) : undefined);
  sendSuccess(res, logs, 'Audit logs fetched successfully');
});

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/users', listUsers);
router.patch('/users/:id/role', validate(updateRoleSchema), updateUserRole);
router.patch('/users/:id/block', validate(blockUserSchema), toggleBlockUser);
router.get('/dashboard-stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

export default router;