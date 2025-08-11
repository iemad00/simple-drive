import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { OtpGenerator, OtpStore } from './otp.types';

@Injectable()
export class OtpService {
  constructor(
    @Inject('OtpStore') private readonly store: OtpStore,
    @Inject('OtpGenerator') private readonly generator: OtpGenerator,
  ) {}

  async request(phone: string, ttlSec: number) {
    if (!phone) throw new BadRequestException('phone required');

    // Remove any existing OTP
    await this.store.del(phone);

    const code = this.generator.generate();
    await this.store.set(phone, code, ttlSec);
    return { code };
  }

  async verify(phone: string, code: string) {
    if (!phone || !code) throw new BadRequestException('phone & code required');
    const stored = await this.store.get(phone);
    if (!stored) throw new UnauthorizedException('OTP expired');
    if (stored !== code) throw new UnauthorizedException('Invalid code');
    await this.store.del(phone);
  }
}
