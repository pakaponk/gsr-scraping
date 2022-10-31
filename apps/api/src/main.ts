import './patch';
import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
      },
    },
  );

  const configService = app.get(ConfigService);

  await app.register(secureSession, {
    secret: configService.get<string>('auth.secureSession.secret'),
    salt: configService.get<string>('auth.secureSession.salt'),
    cookie: {
      httpOnly: true,
      domain: 'localhost',
    },
  });

  await app.register(multipart);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory(errors) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation Failed',
          fields: errors.flatMap(({ property, constraints }) => {
            return Object.entries(constraints).map(([code, message]) => {
              return {
                name: property,
                code,
                message,
              };
            });
          }),
        });
      },
    }),
  );

  const port = configService.get<number>('port');
  await app.listen(port);
}
bootstrap();
