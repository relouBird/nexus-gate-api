import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const time = Date.now() - start;
      const statusCode = res.statusCode;
      const method = req.method.toUpperCase();
      const url = req.originalUrl.toUpperCase();

      // Choix de la couleur pour le statut
      const statusColor = statusCode >= 400 ? '\x1b[31m' : '\x1b[33m'; // rouge ou jaune
      // Choix de la couleur pour le temps
      const timeColor = time > 500 ? '\x1b[31m' : '\x1b[32m'; // rouge ou vert

      console.log(
        `[${new Date().toISOString()}]  \x1b[36m${method}\x1b[0m \x1b[34m${url}\x1b[0m  -  STATUS : ${statusColor}${statusCode}\x1b[0m - ${timeColor}${time}ms\x1b[0m`,
      );
    });

    next();
  }
}