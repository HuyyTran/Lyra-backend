import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CartDetailsDto {
  cartId: string;
  productId: string;
  quantity: number;
}

export class CreateCartDto {
  userId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
