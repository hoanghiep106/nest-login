import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserStatus } from '../enums';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ unique: true })
  username: string;

  @Prop()
  hashedPassword: string;

  @Prop({ default: UserStatus.Active })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);
