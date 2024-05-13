import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Image, ImageDocument } from '../schemas/image.schema';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ImageDetailsDto, ImageDto } from './dto/image.dto';
import { convertToSlug } from './utils/helper';
import { Zero } from '../constant/common';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name)
    private imageModel: Model<ImageDocument>,
    private CloudinaryService: CloudinaryService,
  ) {}

  async uploadImages(files: Array<Express.Multer.File>) {
    try {
      let fileList = [];
      for (let i = Zero; i < files.length; i++) {
        const uploadResponse = await this.CloudinaryService.uploadImage(
          files[i],
        );
        if (uploadResponse.message) {
          throw Error(uploadResponse.message);
        }
        const file: ImageDetailsDto = {
          url: uploadResponse.url,
          image_name: convertToSlug(files[i].originalname.split('.')[Zero]),
        };
        fileList.push(file);
      }
      return fileList;
    } catch (error) {
      console.log(error);
    }
  }

  async createImage(image: ImageDetailsDto) {
    try {
      const { url, image_name } = image;
      const img = await this.imageModel.create({
        url: url,
        image_name: image_name,
      });
      return img;
    } catch (error) {
      console.log(error);
    }
  }
}
