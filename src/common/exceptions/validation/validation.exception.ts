import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(public validationErrors: string[]) {
    super({
      message: 'Validation failed',
      errors: validationErrors,
    });
  }
}
