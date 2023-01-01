import { NextFunction, Request, Response } from 'express';

export const top5AliasProductsMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.query.limit = '5';
    req.query.sort = '-ratings,price';
    req.query.limit = '5';
    req.query.fields = '-_v';
    next();
  };
};
