import { NextFunction, Response } from 'express';

import { AuthenticatedRequestBody, IUser } from '@src/interfaces';
import { clearOrdersService, getInvoicesService, getOrdersService, postOrderService } from '@src/services';

export const getOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getOrdersService(req, res, next);

export const postOrderController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  postOrderService(req, res, next);

export const clearOrdersController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  clearOrdersService(req, res, next);

export const getInvoicesController = (req: AuthenticatedRequestBody<IUser>, res: Response, next: NextFunction) =>
  getInvoicesService(req, res, next);
