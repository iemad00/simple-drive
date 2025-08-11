import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { OtpStore } from '../common/types/otp';

@Injectable()
export class RedisOtpStore implements OtpStore {
  constructor(private readonly redis: RedisService) {}

  async set(phone: string, value: string, ttlSec: number): Promise<void> {
    await this.redis.setex(`otp:${phone}`, ttlSec, value);
  }
  get(phone: string) {
    return this.redis.get(`otp:${phone}`);
  }
  async del(phone: string) {
    await this.redis.del(`otp:${phone}`);
  }
}
