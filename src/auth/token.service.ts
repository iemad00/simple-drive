import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/redis.service';

type JwtPayload = { sub: string; roles: string[]; jti?: string };

@Injectable()
export class TokenService {
  private accessTtl = Number(process.env.JWT_ACCESS_TTL ?? 900);
  private refreshTtl = Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 30);
  private accessSecret = process.env.JWT_ACCESS_SECRET ?? 'access_dev';
  private refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'refresh_dev';

  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  async issuePair(userId: string, roles: string[]) {
    const jti = randomUUID();
    const access_token = await this.jwt.signAsync(
      { sub: userId, roles } as JwtPayload,
      { secret: this.accessSecret, expiresIn: this.accessTtl },
    );
    const refresh_token = await this.jwt.signAsync(
      { sub: userId, roles, jti } as JwtPayload,
      { secret: this.refreshSecret, expiresIn: this.refreshTtl },
    );
    await this.redis.setex(this.rtKey(userId, jti), this.refreshTtl, '1'); // store whitelist
    return { access_token, refresh_token, expires_in: this.accessTtl };
  }

  async rotate(refresh_token: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync(refresh_token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const { sub, roles, jti } = payload || {};
    if (!sub || !jti)
      throw new UnauthorizedException('Malformed refresh token');

    // check token is still valid in Redis
    const exists = await this.redis.get(this.rtKey(sub, jti));
    if (!exists) throw new UnauthorizedException('Refresh token revoked');

    // revoke old, issue new
    await this.redis.del(this.rtKey(sub, jti));
    return this.issuePair(sub, roles ?? ['user']);
  }

  private rtKey(userId: string, jti: string) {
    return `rt:${userId}:${jti}`;
  }
}
