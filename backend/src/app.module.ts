import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CategoryModule } from './category/category.module';
import { AdminModule } from './admin/admin.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { BlogModule } from './blog/blog.module';

const config: ConfigService = new ConfigService();

@Module({
  imports: [
    AuthModule,
    ProductModule,
    CartModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(config.get('MONGODB_URI'), {
      dbName: 'cosmetic',
    }),
    CloudinaryModule,
    CategoryModule,
    AdminModule,
    NotificationModule,
    UserModule,
    OrderModule,
    BlogModule,
  ],
})
export class AppModule {}
