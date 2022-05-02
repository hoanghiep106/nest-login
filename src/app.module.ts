import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import config from './config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.get('MONGO_URI')),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
