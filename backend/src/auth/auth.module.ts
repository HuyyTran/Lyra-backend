import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { ConfigService } from '@nestjs/config';

require('dotenv').config();
const config: ConfigService = new ConfigService();

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: config.get('JWT_SECRET_ACCESS'),
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, JwtAuthGuard, UserService, ConfigService],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
