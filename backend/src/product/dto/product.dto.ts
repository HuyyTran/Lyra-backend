import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  //ValidateNested,
} from 'class-validator';
import { ImageDto } from '../../image/dto/image.dto';
import { CategoryDto } from '../../category/dto/category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'Product name' })
  productName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Product description' })
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'Product price' })
  price: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Product shortDescription' })
  shortDescription: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Product additionalInfos' })
  additionalInfos: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Product productSKU' })
  productSKU: string;

  @IsArray()
  @Type(() => ImageDto)
  @IsOptional()
  @ApiProperty({ description: 'Product Images' })
  images: ImageDto[];

  @IsArray()
  @Type(() => CategoryDto)
  @ApiProperty({ required: true, description: 'Product category' })
  categories: CategoryDto[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: true, description: 'Product quantity' })
  quantity: number;
}

export class ProductUpdateDto {
  @IsNumber()
  @IsOptional()
  price: number;

  @IsNumber()
  @IsOptional()
  quantity: number;
}
