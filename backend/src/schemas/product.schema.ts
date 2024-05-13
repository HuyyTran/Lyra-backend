import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';

export type ProductDocument = Product & Document;
import { Category } from './category.schema';
import { Image } from './image.schema';

@Schema()
export class Review {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, unique: true })
  productSKU: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  shortDescription: string;

  @Prop()
  additionalInfos: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
      },
    ],
  })
  images: Image[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  })
  categories: Category[];

  @Prop({ type: [ReviewSchema], default: [] })
  reviews: Review[];

  @Prop({ default: 0 })
  overallRating: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
