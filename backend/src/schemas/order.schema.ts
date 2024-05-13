import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import mongoose, { Document } from 'mongoose';

export type OrderDocument = Order & Document;

export class OrderItem {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  })
  @ApiProperty()
  productId: string;

  @ApiProperty()
  @Prop({ required: true })
  quantity: number;

  @ApiProperty()
  @Prop()
  isReviewed: boolean;
}

export class DeliveryInfo {
  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  ward: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  addressDetails: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export class Payment {
  @ApiProperty()
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @Prop()
  @ApiProperty({ required: false })
  transactionId: string;
}

@Schema({ timestamps: true })
export class Order {
  @ApiProperty({ type: () => [OrderItem] })
  @Prop({ required: true, type: [OrderItem], default: [] })
  orderItems: OrderItem[];

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string;

  @ApiProperty()
  @Prop({ required: true, type: Payment, default: {} })
  payment: Payment;

  @ApiProperty()
  @Prop({ required: true, type: DeliveryInfo, default: {} })
  deliveryInfo: DeliveryInfo;

  @ApiProperty()
  @Prop({ required: true })
  shippingFee: number;

  @ApiProperty()
  @Prop({ required: true })
  totalPrice: number;

  @ApiProperty()
  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'delivering', 'delivered', 'cancelled'],
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
