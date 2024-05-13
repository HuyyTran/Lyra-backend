import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { CartItem, CartItemSchema } from '../schemas/cart.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductService } from '../product/product.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { Category, CategorySchema } from '../schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CartItem.name,
        schema: CartItemSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [
    JwtService,
    UserService,
    ProductService,
    CategoryService,
    CartService,
  ],
  exports: [CartService],
  controllers: [CartController],
})
export class CartModule {}
