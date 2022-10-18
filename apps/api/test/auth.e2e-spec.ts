import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PrismaService } from '../src/prisma.service';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import secureSession from '@fastify/secure-session';
import { userBuilder } from './utils/mock';

describe('Auth (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    const configService = moduleRef.get<ConfigService>(ConfigService);

    await app.register(secureSession, {
      secret: configService.get<string>('auth.secureSession.secret'),
      salt: configService.get<string>('auth.secureSession.salt'),
      cookie: {
        httpOnly: true,
        domain: 'localhost',
      },
    });

    prisma = moduleRef.get<PrismaService>(PrismaService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  describe('POST /auth/login', () => {
    it('set HttpOnly session cookie when valid credential is given', async () => {
      const mockUser = userBuilder();

      const hashedPasssword = await argon2.hash(mockUser.password);

      await prisma.user.create({
        data: {
          ...mockUser,
          password: hashedPasssword,
        },
      });

      return app
        .inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            username: mockUser.email,
            password: mockUser.password,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(201);

          const sessionCookie = result.cookies[0] as {
            name: string;
            value: string;
            domain: string;
            httpOnly: boolean;
          };

          expect(sessionCookie).toMatchObject({
            name: 'session',
            value: expect.any(String),
            httpOnly: true,
          });
        });
    });
    it('return a user without password when valid credential is given', async () => {
      const mockUser = userBuilder();

      const hashedPasssword = await argon2.hash(mockUser.password);

      const user = await prisma.user.create({
        data: {
          ...mockUser,
          password: hashedPasssword,
        },
      });

      return app
        .inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            username: mockUser.email,
            password: mockUser.password,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(201);
          expect(JSON.parse(result.body)).toEqual({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          });
        });
    });
    it('return 401 Unauthenticated when the password is incorrect', async () => {
      const mockUser = userBuilder();

      const hashedPasssword = await argon2.hash(mockUser.password);

      await prisma.user.create({
        data: {
          ...mockUser,
          password: hashedPasssword,
        },
      });

      return app
        .inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            username: mockUser.email,
            password: 'WRONG_PASSWORD',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
        });
    });
    it('return 401 Unauthenticated when the user does not exist', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/auth/login',
          payload: {
            username: 'EMAIL_NOT_EXISTID',
            password: 'PASSWORD',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
        });
    });
  });

  afterEach(async () => {
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers]);
  });

  afterAll(async () => {
    await app.close();
  });
});
