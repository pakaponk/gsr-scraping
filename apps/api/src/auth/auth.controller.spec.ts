import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers]);
  });
});
