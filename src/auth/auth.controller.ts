import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ErrorMessage, UserStatus } from '../enums';
import { UserService } from '../user/user.service';
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
    if (!user) {
      throw new UnauthorizedException({
        message: ErrorMessage.INVALID_CREDENTIALS,
      });
    }

    if (user.status === UserStatus.Locked) {
      throw new UnauthorizedException({
        message: ErrorMessage.LOCKED_USER,
      });
    }

    const matched = await this.authService.validateUser(
      user,
      loginDto.password,
    );
    if (!matched) {
      // TODO: Count failed attemps and lock user when rate limit is reached
      throw new UnauthorizedException({
        message: ErrorMessage.INVALID_CREDENTIALS,
      });
    }
    return {
      accessToken: this.authService.generateAccessToken(loginDto.username),
    };
  }
}
