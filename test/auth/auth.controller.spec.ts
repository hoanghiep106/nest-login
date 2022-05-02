import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { LoginDto } from 'src/auth/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { ErrorMessage, UserStatus } from 'src/enums';
import { User } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { loginFailedRateLimiter } from 'src/utils/rateLimiter';
import { mockJwtService } from 'test/utils';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockJwtToken = 'token';
  const mockUsername = 'hiep';
  const mockPlainPassword = 'ah56XGG@*Lp^wgAr';
  const mockHashedPassword =
    '$2b$10$cjI.PiVqLrVfkWPWhNibseEwAH3ZCPMmtcIdQJodNOrW/Ha1A8zTS';

  const mockUser: User = {
    username: mockUsername,
    hashedPassword: mockHashedPassword,
    status: UserStatus.Active,
  };

  const mockLoginDto: LoginDto = {
    username: mockUsername,
    password: mockPlainPassword,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            generateToken: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            validate: jest.fn(),
            lock: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('login successfully', async () => {
    jest
      .spyOn(userService, 'findOne')
      .mockResolvedValue(Promise.resolve(mockUser));
    jest
      .spyOn(userService, 'validate')
      .mockResolvedValue(Promise.resolve(true));
    jest.spyOn(authService, 'generateToken').mockReturnValue(mockJwtToken);

    const response = await authController.login(mockLoginDto);

    expect(response).toMatchObject({
      accessToken: mockJwtToken,
    });
  });

  it('user not found', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValue(Promise.resolve(null));
    try {
      await authController.login(mockLoginDto);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual(ErrorMessage.INVALID_CREDENTIALS);
    }
  });

  it('user is locked', async () => {
    const lockedUser = {
      ...mockUser,
      status: UserStatus.Locked,
    };
    jest
      .spyOn(userService, 'findOne')
      .mockResolvedValue(Promise.resolve(lockedUser));
    try {
      await authController.login(mockLoginDto);
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toEqual(ErrorMessage.LOCKED_USER);
    }
  });

  it('wrong credentials', async () => {
    jest
      .spyOn(userService, 'findOne')
      .mockResolvedValue(Promise.resolve(mockUser));
    jest
      .spyOn(userService, 'validate')
      .mockResolvedValue(Promise.resolve(false));
    try {
      await authController.login(mockLoginDto);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual(ErrorMessage.INVALID_CREDENTIALS);
    }
  });

  it('rate limit reached', async () => {
    jest
      .spyOn(userService, 'findOne')
      .mockResolvedValue(Promise.resolve(mockUser));
    jest
      .spyOn(userService, 'validate')
      .mockResolvedValue(Promise.resolve(false));
    jest.spyOn(loginFailedRateLimiter, 'isReached').mockReturnValue(true);
    const mockRateLimiterIncrease = jest.spyOn(
      loginFailedRateLimiter,
      'increase',
    );
    const mockRateLimiterReset = jest.spyOn(loginFailedRateLimiter, 'reset');

    try {
      await authController.login(mockLoginDto);
    } catch (error) {
      expect(userService.lock).toBeCalledWith(mockUser.username);

      expect(mockRateLimiterIncrease).toBeCalledWith(mockUser.username);
      expect(mockRateLimiterReset).toBeCalledWith(mockUser.username);

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toEqual(ErrorMessage.LOCKED_USER);
    }
  });
});
