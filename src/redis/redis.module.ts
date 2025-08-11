// src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (): RedisClient => {
        const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
        return new Redis(url);
      },
    },
    {
      provide: RedisService,
      useFactory: (client: RedisClient) => new RedisService(client),
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
