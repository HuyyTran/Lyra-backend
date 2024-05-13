import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';
import { ImageService } from '../image/image.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Image, ImageSchema } from '../schemas/image.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtService } from '@nestjs/jwt';
import { OrderService } from '../order/order.service';
import { CartService } from '../cart/cart.service';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { CartItem, CartItemSchema } from '../schemas/cart.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { BlogService } from '../blog/blog.service';
import { Blog, BlogSchema } from '../schemas/blog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Image.name, schema: ImageSchema },
      { name: Order.name, schema: OrderSchema },
      { name: CartItem.name, schema: CartItemSchema },
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    JwtService,
    OrderService,
    CartService,
    BlogService,
    NotificationService,
    UserService,
    ProductService,
    CloudinaryService,
    CategoryService,
    ImageService,
    AdminService,
  ],
})
export class AdminModule {}
