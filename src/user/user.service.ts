import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import config from '../config';
import { UserStatus } from '../enums';
import { checkPassword, hashPassword } from '../utils/password';
import { CreateUserDto } from './user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(
    createUserDto: CreateUserDto,
    plainPassword: string,
  ): Promise<User> {
    const saltRounds = config.get('SALT_ROUNDS');
    const hashedPassword = await hashPassword(plainPassword, saltRounds);
    const user = new this.userModel({
      ...createUserDto,
      hashedPassword,
    });
    return user.save();
  }

  validate(user: User, plainPassword: string): Promise<boolean> {
    return checkPassword(plainPassword, user.hashedPassword);
  }

  async findOne(username: string): Promise<User> {
    return this.userModel.findOne({ username });
  }

  async lock(username: string) {
    await this.userModel.updateOne({ username }, { status: UserStatus.Locked });
  }
}
