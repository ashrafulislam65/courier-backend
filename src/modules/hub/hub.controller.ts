import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import * as hubService from './hub.service';

export const createZone = catchAsync(async (req: Request, res: Response) => {
  const zone = await hubService.createZone(req.body);
  sendSuccess(res, zone, 'Zone created successfully', 201);
});

export const listZones = catchAsync(async (req: Request, res: Response) => {
  const zones = await hubService.listZones();
  sendSuccess(res, zones, 'Zones fetched successfully');
});

export const createHub = catchAsync(async (req: Request, res: Response) => {
  const hub = await hubService.createHub(req.body);
  sendSuccess(res, hub, 'Hub created successfully', 201);
});

export const listHubs = catchAsync(async (req: Request, res: Response) => {
  const hubs = await hubService.listHubs();
  sendSuccess(res, hubs, 'Hubs fetched successfully');
});