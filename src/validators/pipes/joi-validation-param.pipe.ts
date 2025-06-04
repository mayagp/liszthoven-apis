import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { Schema } from 'joi';

@Injectable()
export class JoiValidationParamPipe implements PipeTransform {
  constructor(private schema: Schema) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      await this.schema.validateAsync(value, {
        abortEarly: false,
      });
      return value;
    } catch (error) {
      // const message = error.details.map((i: { message: any }) => i.message);
      throw new Error(error.message);
    }
  }
}
