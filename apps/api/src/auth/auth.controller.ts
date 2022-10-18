import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Session,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Session as SecureSession } from '@fastify/secure-session';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Session() session: SecureSession) {
    const { access_token } = await this.authService.login(req.user);
    session.set('token', access_token);
    session.options({
      path: '/',
    });
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Session() session: SecureSession) {
    session.delete();

    return { success: true };
  }

  @Post('local/register')
  async localRegister(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.localRegister(createUserDto);
    return {
      user,
    };
  }
}
