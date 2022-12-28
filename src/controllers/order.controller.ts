import { NextFunction, Response } from 'express';

import { AuthenticatedRequestBody, IUser } from '@src/interfaces';
import {
  clearAllOrdersService,
  clearSingleOrderService,
  getInvoicesService,
  getOrdersService,
  postOrderService,
} from '@src/services';

export const getOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getOrdersService(req, res, next);

export const postOrderController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  postOrderService(req, res, next);

export const clearSingleOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  clearSingleOrderService(req, res, next);

export const clearAllOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  clearAllOrdersService(req, res, next);

export const getInvoicesController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getInvoicesService(req, res, next);
