import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      const statusColor =
        statusCode >= 500
          ? chalk.red.bold
          : statusCode >= 400
            ? chalk.yellow.bold
            : statusCode >= 300
              ? chalk.cyan.bold
              : chalk.green.bold;

      this.logger.log(
        `${chalk.blue(method)} ${chalk.white(originalUrl)} ` +
          `${statusColor(statusCode.toString())} ${chalk.magenta(contentLength || '')} - ` +
          `${chalk.gray(userAgent)} ${chalk.green(ip)}`,
      );
    });

    next();
  }
}
