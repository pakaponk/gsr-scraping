import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
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

  const port = configService.get<number>('port');

  await app.listen(port);
}
bootstrap();
