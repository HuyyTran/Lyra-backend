import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema({ timestamps: true })
export class Image {
  @Prop({ required: true })
  image_name: string;
  @Prop({ required: true })
  url: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
