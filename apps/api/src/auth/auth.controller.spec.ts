import { UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { userBuilder } from '../../test/utils/mock';

describe('AuthController', () => {
  let controller: AuthController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UserService, JwtService, PrismaService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('POST /auth/local/register', () => {
    it('create a new user', async () => {
      const mockNewUser = userBuilder();
      const mockCreateUserDto = {
        email: mockNewUser.email,
        name: mockNewUser.name,
        password: mockNewUser.password,
      };

      const totalUsers = await prisma.user.count();

      const { user } = await controller.localRegister(mockCreateUserDto);

      expect(user).toEqual({
        id: expect.any(String),
        email: mockCreateUserDto.email,
        name: mockCreateUserDto.name,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const newTotalUsers = await prisma.user.count();
      expect(newTotalUsers).toEqual(totalUsers + 1);
    });
    it('password must be hashed', async () => {
      const mockNewUser = userBuilder();
      const mockCreateUserDto = {
        email: mockNewUser.email,
        name: mockNewUser.name,
        password: mockNewUser.password,
      };

      const { user } = await controller.localRegister(mockCreateUserDto);

      const userWithPassword = await prisma.user.findUnique({
        where: { id: user.id },
      });

      try {
        expect(
          await argon2.verify(
            userWithPassword.password,
            mockCreateUserDto.password,
          ),
        ).toEqual(true);
      } catch (error) {
        throw new Error(
          'Password should be hased with Argon2 before saving to the database',
        );
      }
    });
    it('should return 422 UnprocessableEntity when the given email is already taken', async () => {
      const mockExistingUser = userBuilder({
        overrides: { email: 'test@example.com' },
      });
      await prisma.user.create({ data: mockExistingUser });

      const mockCreateUserDto = {
        email: mockExistingUser.email,
        name: mockExistingUser.name,
        password: mockExistingUser.password,
      };

      await expect(
        controller.localRegister(mockCreateUserDto),
      ).rejects.toThrowError(UnprocessableEntityException);

      try {
        await controller.localRegister(mockCreateUserDto);
      } catch (error) {
        if (error instanceof UnprocessableEntityException) {
          expect(error.getResponse()).toMatchInlineSnapshot(`
            Object {
              "fields": Array [
                Object {
                  "code": "notUnique",
                  "message": "The email \`test@example.com\` has been taken",
                  "name": "email",
                },
              ],
              "message": "Validation Failed",
              "statusCode": 422,
            }
          `);
        }
      }
    });
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers]);
  });
});
