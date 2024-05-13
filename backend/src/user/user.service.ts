import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../schemas/user.schema';
import { UserDetail } from './dto/userDetail.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createUser(user: UserDetail) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await this.userModel.create({
        ...user,
        hashPassword: hashedPassword,
      });
      return newUser;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userModel.findById(id);
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email }).exec();
  }

  async updateUser(id: string, user: any) {
    try {
      const userToUpdate = await this.userModel.findById(id);
      if (!userToUpdate) {
        throw new Error('User not found');
      }
      if (!user.oldPassword) {
        throw new Error('Does not have old password');
      }
      const currentPassword = user.oldPassword;
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userToUpdate.hashPassword,
      );
      if (!isPasswordValid) {
        throw new Error('Password is not correct');
      }
      let updateInformation: {};
      if (user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        updateInformation = { ...user, hashPassword: hashedPassword };
      } else {
        updateInformation = user;
      }
      if (user.firstName) {
        updateInformation = { ...updateInformation, firstName: user.firstName };
      }
      if (user.lastName) {
        updateInformation = { ...updateInformation, lastName: user.lastName };
      }
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateInformation,
      );
      return updatedUser;
    } catch (error) {
      console.log(error);
    }
  }
}
