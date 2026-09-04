import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authLimiter } from '../../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  refreshTokenSchema,
} from './auth.validation';
import {
  register,
  login,
  googleLoginHandler,
  refreshToken,
  logout,
} from './auth.controller';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleLoginSchema), googleLoginHandler);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', logout);

export default router;