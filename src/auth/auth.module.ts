import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import config from '../config';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: config.get('JWT_SECRET'),
      signOptions: {
        expiresIn: config.get('JWT_EXPIRATION_DURATION'),
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
