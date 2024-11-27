import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export default class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return new mongoose.Types.ObjectId(value);
    } catch (err) {
      throw new BadRequestException(
        `The value provided for ${metadata.data} is not a vaild object id`,
      );
    }
  }
}
