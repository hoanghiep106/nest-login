import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';
import { checkPassword } from '../utils/password';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  validateUser(user: User, plainPassword: string): Promise<boolean> {
    return checkPassword(plainPassword, user.hashedPassword);
  }

  generateAccessToken(username: string): string {
    const payload = { username };
    return this.jwtService.sign(payload);
  }
}
