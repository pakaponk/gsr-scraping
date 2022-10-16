import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Need to use @ts-ignore because the `req` type in the type defnition of JwtFromRequestFunction is Express.Request which is not correct in our case since we use fastify
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        JwtStrategy.extractFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.jwt.secret'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }

  private static extractFromCookie(req: FastifyRequest): string | null {
    if (req.session && req.session.get('token')) {
      return req.session.get('token');
    }
    return null;
  }
}
