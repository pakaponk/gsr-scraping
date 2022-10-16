import { Controller, Post, Request, UseGuards, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { Session as SecureSession } from '@fastify/secure-session';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Session() session: SecureSession) {
    const { access_token } = await this.authService.login(req.user);
    session.set('token', access_token);
    return req.user;
  }
}
