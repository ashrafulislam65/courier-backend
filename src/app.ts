import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import shipmentRoutes from './modules/shipment/shipment.routes';
import hubRoutes from './modules/hub/hub.routes';
import courierRoutes from './modules/courier/courier.routes';
import paymentRoutes, { stripeWebhook } from './modules/payment/payment.routes';
import adminRoutes from './modules/admin/admin.routes';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(cookieParser());
app.use(apiLimiter);

// Stripe webhook needs the RAW body — must be registered BEFORE express.json()
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Courier API is running', data: {} });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/shipments', shipmentRoutes);
app.use('/api/v1', hubRoutes); // exposes /zones and /hubs
app.use('/api/v1/courier', courierRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;