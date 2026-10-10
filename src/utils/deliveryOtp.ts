import crypto from 'crypto';
import { env } from '../config/env';

// Shipment id + server secret থেকে ৪ অঙ্কের কোড বানায়। কোথাও store করতে হয় না।
export const generateDeliveryOtp = (shipmentId: string): string => {
  const digest = crypto
    .createHmac('sha256', env.jwtAccessSecret)
    .update(`delivery-otp:${shipmentId}`)
    .digest();
  return (digest.readUInt32BE(0) % 10000).toString().padStart(4, '0');
};

export const isDeliveryOtpValid = (shipmentId: string, input: string): boolean => {
  if (!/^\d{4}$/.test(input)) return false;
  return crypto.timingSafeEqual(
    Buffer.from(generateDeliveryOtp(shipmentId)),
    Buffer.from(input)
  );
};