import { ApiProperty } from '@nestjs/swagger';
import { DeliveryInfo, Payment } from '../../schemas/order.schema';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  cartItems: String[];

  user: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Type(() => Payment)
  payment: Payment;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeliveryInfo)
  deliveryInfo: DeliveryInfo;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  shippingFee: number;
}
