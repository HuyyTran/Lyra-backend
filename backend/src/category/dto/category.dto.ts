import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CategoryDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}

export class CategoryDetails {
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'Category name' })
  name: string;
}
