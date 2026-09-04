import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import * as courierService from './courier.service';

const availabilitySchema = z.object({
  body: z.object({ isAvailable: z.boolean() }),
});

const setAvailability = catchAsync(async (req: Request, res: Response) => {
  const profile = await courierService.setAvailability(req.user!.id, req.body.isAvailable);
  sendSuccess(res, profile, 'Availability updated successfully');
});

const getMyAssigned = catchAsync(async (req: Request, res: Response) => {
  const shipments = await courierService.getMyAssignedShipments(req.user!.id);
  sendSuccess(res, shipments, 'Assigned shipments fetched successfully');
});

const getMyEarnings = catchAsync(async (req: Request, res: Response) => {
  const earnings = await courierService.getMyEarnings(req.user!.id);
  sendSuccess(res, earnings, 'Earnings fetched successfully');
});

const router = Router();
router.use(authenticate, authorize('COURIER'));

router.patch('/availability', validate(availabilitySchema), setAvailability);
router.get('/my-assigned', getMyAssigned);
router.get('/earnings', getMyEarnings);

export default router;