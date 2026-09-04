import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import {
  createShipmentSchema,
  listShipmentsSchema,
  assignCourierSchema,
  updateStatusSchema,
  transferHubSchema,
} from './shipment.validation';
import {
  createShipment,
  listShipments,
  getShipment,
  searchShipment,
  getTracking,
  cancelShipment,
  assignCourier,
  updateStatus,
  transferHub,
} from './shipment.controller';

const router = Router();

router.use(authenticate);

router.post('/', authorize('CUSTOMER'), validate(createShipmentSchema), createShipment);
router.get('/', validate(listShipmentsSchema), listShipments);
router.get('/search', searchShipment);
router.get('/:id', getShipment);
router.get('/:id/tracking', getTracking);
router.patch('/:id/cancel', authorize('CUSTOMER'), cancelShipment);
router.post('/:id/assign-courier', authorize('ADMIN'), validate(assignCourierSchema), assignCourier);
router.post('/:id/transfer-hub', authorize('ADMIN', 'COURIER'), validate(transferHubSchema), transferHub);
router.patch('/:id/status', authorize('COURIER', 'ADMIN'), validate(updateStatusSchema), updateStatus);

export default router;