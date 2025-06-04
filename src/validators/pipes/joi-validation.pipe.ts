import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await this.schema.validateAsync(value, {
        abortEarly: false,
      });
    } catch (error) {
      console.log(error);
      const message = error.details.map((i: { message: any }) => i.message);
      throw new BadRequestException(message);
    }
  }
}
