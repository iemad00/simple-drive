import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

const envNum = (k: string, d: number) => Number(process.env[k] ?? d);

@Injectable()
export class AuthService {
  private ttl = envNum('OTP_TTL_SECONDS', 300);

  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
  ) {}

  async requestOtp(phone: string) {
    const { code } = await this.otp.request(phone, this.ttl);
    // TODO: send code via SMS
    console.log(`OTP for ${phone}: ${code}`);
    return { success: true };
  }

  async verifyOtp(phone: string, code: string) {
    await this.otp.verify(phone, code);
    let user = await this.users.findOne({ where: { phone } });
    if (!user) user = await this.users.save(this.users.create({ phone }));
    return this.tokens.issuePair(user.id, ['user']);
  }

  async refresh(refresh_token: string) {
    return this.tokens.rotate(refresh_token);
  }
}
