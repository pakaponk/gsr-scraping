import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dtos/create-user.dto';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await argon2.verify(user.password, pass))) {
      return this.excludePassword(user);
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getCurrentUser({ userId }: { userId: string }) {
    const user = await this.userService.findById(userId);
    return this.excludePassword(user);
  }

  private async excludePassword(user: User): Promise<UserWithoutPassword> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async localRegister({
    email,
    name,
    password,
  }: CreateUserDto): Promise<UserWithoutPassword> {
    const hashedPasssword = await argon2.hash(password);
    const user = await this.userService.create({
      email,
      name,
      password: hashedPasssword,
    });
    return this.excludePassword(user);
  }
}
