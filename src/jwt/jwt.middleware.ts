import { Request, Response, NextFunction } from 'express';

export const JwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.headers['x-jwt']);
  next();
};
