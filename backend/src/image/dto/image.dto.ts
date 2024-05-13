import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ImageDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}

export class ImageDetailsDto {
  @IsNotEmpty()
  image_name: string;

  @IsNotEmpty()
  url: string;
}
