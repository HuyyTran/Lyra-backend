import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';

export type CartItemDocument = CartItem & Document;

@Schema()
export class CartItem {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  @ApiProperty({ description: 'The ID of the user' })
  user: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  })
  @ApiProperty({ description: 'The ID of the product' })
  product: string;

  @Prop({ required: true })
  @ApiProperty({ description: 'The quantity of the product' })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
