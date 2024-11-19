import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';

export default class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return new ObjectId(value);
    } catch (err) {
      throw new BadRequestException(
        `The value provided for ${metadata.data} is not a vaild object id`,
      );
    }
  }
}
