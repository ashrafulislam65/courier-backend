import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { updateMeSchema } from './user.validation';
import { getMe, updateMe } from './user.controller';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(updateMeSchema), updateMe);

export default router;