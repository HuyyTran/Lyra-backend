import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { CartItem, CartItemSchema } from '../schemas/cart.schema';
import { Order, OrderSchema } from '../schemas/order.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Image, ImageSchema } from '../schemas/image.schema';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CartModule } from '../cart/cart.module';
import { CategoryModule } from '../category/category.module';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    CartModule,
    CategoryModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: CartItem.name,
        schema: CartItemSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Image.name, schema: ImageSchema },
    ]),
  ],
  providers: [
    CartService,
    ProductService,
    NotificationService,
    UserService,
    JwtService,
    ConfigService,
    OrderService,
  ],
  controllers: [OrderController],
})
export class OrderModule {}
