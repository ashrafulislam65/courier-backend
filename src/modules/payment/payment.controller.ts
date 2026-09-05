import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { stripe } from '../../config/stripe';
import { env } from '../../config/env';
import * as paymentService from './payment.service';
import { AppError } from '../../utils/appError';

export const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const { shipmentId } = req.body;
  const result = await paymentService.initiatePayment(shipmentId, req.user!.id);
  sendSuccess(res, result, 'Payment session created successfully');
});

// NOTE: this route uses express.raw() body parsing, wired in app.ts
export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err: any) {
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  await paymentService.handleWebhookEvent(event);
  res.json({ received: true });
});

export const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.getPaymentStatus(req.params.shipmentId);
  sendSuccess(res, payment, 'Payment status fetched successfully');
});