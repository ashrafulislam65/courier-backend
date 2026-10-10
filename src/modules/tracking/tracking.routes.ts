import { Request, Response, Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { getPublicTracking } from '../shipment/shipment.service';

const router = Router();

router.get(
  '/:trackingCode',
  catchAsync(async (req: Request, res: Response) => {
    const data = await getPublicTracking(req.params.trackingCode);
    sendSuccess(res, data, 'Tracking information fetched successfully');
  })
);

export default router;