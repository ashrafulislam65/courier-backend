import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { initiatePayment, stripeWebhook, getPaymentStatus } from './payment.controller';

const initiateSchema = z.object({
  body: z.object({ shipmentId: z.string().uuid() }),
});

const router = Router();

// Webhook mounted separately in app.ts with raw body parsing (NOT here)
router.post('/initiate', authenticate, authorize('CUSTOMER'), validate(initiateSchema), initiatePayment);
router.get('/:shipmentId', authenticate, getPaymentStatus);

export default router;
export { stripeWebhook };