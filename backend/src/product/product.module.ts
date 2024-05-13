import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Image, ImageSchema } from '../schemas/image.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { CategoryService } from '../category/category.service';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    CategoryModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      { name: Image.name, schema: ImageSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [CategoryService, ProductService],
})
export class ProductModule {}
