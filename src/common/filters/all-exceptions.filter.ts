import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;

    // Nếu exception là HttpException (bao gồm lỗi từ ValidationPipe)
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      // Xử lý lỗi từ ValidationPipe
      if (
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).message
      ) {
        message = (exceptionResponse as any).message; // Lấy thông báo lỗi từ ValidationPipe
      } else {
        message = exceptionResponse; // Trả về lỗi khác nếu không phải từ ValidationPipe
      }
    } else {
      // Lỗi không phải là HttpException
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
