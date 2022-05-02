import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(username: string): string {
    const payload = { username };
    return this.jwtService.sign(payload);
  }
}
