import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
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
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<AccessTokenDto> {
    // Check before we read from database to reduce database load
    if (loginFailedRateLimiter.isReached(loginDto.username)) {
      throw new ForbiddenException({ message: ErrorMessage.LOCKED_USER });
    }

    const user = await this.userService.findOne(loginDto.username);

    if (!user) {
      loginFailedRateLimiter.increase(loginDto.username);

      // Lock not-found users temporarily to avoid reading from the database next time
      if (loginFailedRateLimiter.isReached(loginDto.username)) {
        throw new ForbiddenException({ message: ErrorMessage.LOCKED_USER });
      }

      throw new UnauthorizedException({
        message: ErrorMessage.INVALID_CREDENTIALS,
      });
    }

    if (user.status === UserStatus.Locked) {
      throw new ForbiddenException({ message: ErrorMessage.LOCKED_USER });
    }

    const matched = await this.userService.validate(user, loginDto.password);
    if (!matched) {
      // Increase login failed attempts in rate limiter
      loginFailedRateLimiter.increase(user.username);

      // If rate limit is reached, lock the user
      if (loginFailedRateLimiter.isReached(user.username)) {
        await this.userService.lock(user.username);
        throw new ForbiddenException({ message: ErrorMessage.LOCKED_USER });
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
