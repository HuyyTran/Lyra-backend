import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LogInRequest {
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'User email' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'User password' })
  password: string;
}
