import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.query) {
      for (const key in req.query) {
        // need to use try catch because JSON.parse will throw error if the value is not a valid JSON
        try {
          if (Array.isArray(JSON.parse(req.query[key] as string))) {
            req.query[key] = JSON.parse(req.query[key] as string);
          }
        } catch (error) {
          // bypass
        }
      }
    }
    next();
  }
}
