import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
