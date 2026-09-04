import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import * as shipmentService from './shipment.service';

export const createShipment = catchAsync(async (req: Request, res: Response) => {
  const shipment = await shipmentService.createShipment(req.user!.id, req.body);
  sendSuccess(res, shipment, 'Shipment created successfully', 201);
});

export const listShipments = catchAsync(async (req: Request, res: Response) => {
  const { status, page, limit, sortBy, sortOrder } = req.query;

  const scope: { customerId?: string; courierId?: string } = {};
  if (req.user!.role === 'CUSTOMER') scope.customerId = req.user!.id;
  if (req.user!.role === 'COURIER') scope.courierId = req.user!.id;

  const result = await shipmentService.listShipments(
    {
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    },
    scope
  );
  sendSuccess(res, result, 'Shipments fetched successfully');
});

export const getShipment = catchAsync(async (req: Request, res: Response) => {
  const shipment = await shipmentService.getShipmentById(req.params.id);
  sendSuccess(res, shipment, 'Shipment fetched successfully');
});

export const searchShipment = catchAsync(async (req: Request, res: Response) => {
  const { q } = req.query;
  const shipment = await shipmentService.searchShipmentByTrackingCode(String(q || ''));
  sendSuccess(res, shipment, 'Shipment found');
});

export const getTracking = catchAsync(async (req: Request, res: Response) => {
  const history = await shipmentService.getShipmentTracking(req.params.id);
  sendSuccess(res, history, 'Tracking history fetched successfully');
});

export const cancelShipment = catchAsync(async (req: Request, res: Response) => {
  const shipment = await shipmentService.cancelShipment(req.params.id, req.user!.id);
  sendSuccess(res, shipment, 'Shipment cancelled successfully');
});

export const assignCourier = catchAsync(async (req: Request, res: Response) => {
  const { courierId } = req.body;
  const shipment = await shipmentService.assignCourier(req.params.id, courierId, req.user!.id);
  sendSuccess(res, shipment, 'Courier assigned successfully');
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, note } = req.body;
  const shipment = await shipmentService.updateShipmentStatus(req.params.id, status, req.user!.id, note);
  sendSuccess(res, shipment, 'Shipment status updated successfully');
});

export const transferHub = catchAsync(async (req: Request, res: Response) => {
  const { toHubId } = req.body;
  const shipment = await shipmentService.transferHub(req.params.id, toHubId, req.user!.id);
  sendSuccess(res, shipment, 'Shipment transferred to new hub successfully');
});