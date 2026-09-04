import { PaymentStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { AppError } from '../../utils/appError';
import { env } from '../../config/env';

export const initiatePayment = async (shipmentId: string, customerId: string) => {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, customerId, deletedAt: null },
  });
  if (!shipment) throw new AppError('Shipment not found', 404);

  const existingPayment = await prisma.payment.findUnique({ where: { shipmentId } });
  if (existingPayment && existingPayment.status === 'SUCCESS') {
    throw new AppError('This shipment has already been paid for', 400);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          product_data: { name: `Shipment ${shipment.trackingCode}` },
          unit_amount: Math.round(Number(shipment.price) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${env.clientUrl}/payment/success?shipmentId=${shipmentId}`,
    cancel_url: `${env.clientUrl}/payment/cancel?shipmentId=${shipmentId}`,
    metadata: { shipmentId },
  });

  const payment = await prisma.payment.upsert({
    where: { shipmentId },
    update: { sessionId: session.id, status: PaymentStatus.PENDING, amount: shipment.price },
    create: {
      shipmentId,
      amount: shipment.price,
      sessionId: session.id,
      status: PaymentStatus.PENDING,
    },
  });

  return { checkoutUrl: session.url, payment };
};

export const handleWebhookEvent = async (event: any) => {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const shipmentId = session.metadata?.shipmentId;
    if (!shipmentId) return;

    await prisma.payment.update({
      where: { shipmentId },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionId: session.payment_intent as string,
      },
    });
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const shipmentId = session.metadata?.shipmentId;
    if (!shipmentId) return;

    await prisma.payment.update({
      where: { shipmentId },
      data: { status: PaymentStatus.FAILED },
    });
  }
};

export const getPaymentStatus = async (shipmentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { shipmentId } });
  if (!payment) throw new AppError('Payment record not found', 404);
  return payment;
};