import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createZoneSchema, createHubSchema } from './hub.validation';
import { createZone, listZones, createHub, listHubs } from './hub.controller';

const router = Router();

router.use(authenticate);

router.get('/zones', listZones);
router.post('/zones', authorize('ADMIN'), validate(createZoneSchema), createZone);

router.get('/hubs', listHubs);
router.post('/hubs', authorize('ADMIN'), validate(createHubSchema), createHub);

export default router;