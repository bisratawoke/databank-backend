import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class SubCategory extends Document {
  @Prop({ required: true, unique: true, type: String })
  name: string;
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  })
  category: Types.ObjectId[];
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
