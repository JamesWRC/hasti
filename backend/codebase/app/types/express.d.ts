import type { User } from '@/backend/interfaces/user'
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }

  export type Middleware = <ParamsDictionary, any, any>(
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | NextFunction> | void | NextFunction;
}
