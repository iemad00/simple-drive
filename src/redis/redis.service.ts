import { Injectable, Inject } from '@nestjs/common';
import type { Redis as RedisClient } from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClient) {}

  setex(key: string, ttl: number, value: string) {
    return this.client.setex(key, ttl, value);
  }
  get(key: string) {
    return this.client.get(key);
  }
  del(key: string) {
    return this.client.del(key);
  }
}
