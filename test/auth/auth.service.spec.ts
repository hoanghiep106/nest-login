import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { mockJwtService } from 'test/utils';

describe('AuthService', () => {
  let authService: AuthService;
  const mockUsername = 'hiep';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('token should be sign with username', () => {
    authService.generateToken(mockUsername);

    expect(mockJwtService.sign).toBeCalledWith({
      username: mockUsername,
    });
  });
});
