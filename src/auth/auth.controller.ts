import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorMessage, UserStatus } from '../enums';
import { UserService } from '../user/user.service';
import { loginFailedRateLimiter } from '../utils/rateLimiter';
import { AccessTokenDto, LoginDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AccessTokenDto> {
    const user = await this.userService.findOne(loginDto.username);
    // Username not found
    if (!user) {
      throw new UnauthorizedException({
        message: ErrorMessage.INVALID_CREDENTIALS,
      });
    }

    // User is locked
    if (user.status === UserStatus.Locked) {
      throw new ForbiddenException({
        message: ErrorMessage.LOCKED_USER,
      });
    }

    const matched = await this.userService.validate(user, loginDto.password);
    if (!matched) {
      // Increase login failed attempts in rate limiter
      loginFailedRateLimiter.increase(user.username);

      // If rate limit is reached:
      // - Lock the user
      // - Reset key in rate limiter to save memory
      // - Notify that user has been locked
      if (loginFailedRateLimiter.isReached(user.username)) {
        this.userService.lock(user.username);

        loginFailedRateLimiter.reset(user.username);

        throw new ForbiddenException({
          message: ErrorMessage.LOCKED_USER,
        });
      }

      throw new UnauthorizedException({
        message: ErrorMessage.INVALID_CREDENTIALS,
      });
    }
    return {
      accessToken: this.authService.generateToken(loginDto.username),
    };
  }
}
