import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma.service';

type UserCreateInput = Pick<User, 'email' | 'name' | 'password'>;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async create({ name, email, password }: UserCreateInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          // Unique constraint failed. Ref: https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
          case 'P2002':
            throw new UnprocessableEntityException({
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              message: `Validation Failed`,
              fields: [
                {
                  name: 'email',
                  code: 'notUnique',
                  message: `The email \`${email}\` has been taken`,
                },
              ],
            });
        }
      }
      throw error;
    }
  }
}
