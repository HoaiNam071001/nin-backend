import { HttpException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export class DuplicateEntryException extends HttpException {
  constructor() {
    super('Duplicate entry', HttpStatus.CONFLICT);
  }

  static handleQueryFailedError(error: QueryFailedError): boolean {
    return error.message.includes('duplicate key value');
  }
}
