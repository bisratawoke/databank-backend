import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class Category extends Document {
  @Prop({ required: true, unique: true, type: String })
  name: string;
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
  })
  subcategory: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
