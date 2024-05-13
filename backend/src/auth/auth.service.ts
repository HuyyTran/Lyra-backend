import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.hashPassword))) {
      const { hashPassword, ...result } = user;
      return result;
    }
    return null;
  }

  async generateRefreshToken(user: any) {
    const payload = { id: user['_doc'].id, role: user['_doc'].role };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async generateToken(user: any) {
    const payload = {
      id: user['_doc']._id,
      role: user['_doc'].role,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '15m',
        secret: this.configService.get('JWT_SERECT_ACCESS'),
      }),
      refresh_token: await this.generateRefreshToken(user),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const { email, role } = this.jwtService.verify(refreshToken);
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateToken(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
