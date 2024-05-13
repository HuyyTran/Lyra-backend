import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
export class UserDetail {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true, description: 'User email' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'User password' })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'User first name' })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'User last name' })
  lastName: string;
}
