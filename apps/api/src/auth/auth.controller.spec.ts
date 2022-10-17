import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import * as argon2 from 'argon2';

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
      const mockCreateUserDto = {
        email: 'test@example.com',
        name: 'John Doe',
        password: '1q2w3e4r',
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
      const mockCreateUserDto = {
        email: 'test@example.com',
        name: 'John Doe',
        password: '1q2w3e4r',
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
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers]);
  });
});
