import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncController = (request: Request, response: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (controller: AsyncController): RequestHandler =>
  (request, response, next) => {
    void controller(request, response, next).catch(next);
  };
