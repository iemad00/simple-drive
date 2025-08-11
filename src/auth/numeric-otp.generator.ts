import { Injectable } from '@nestjs/common';
import { OtpGenerator } from './otp.types';

@Injectable()
export class NumericOtpGenerator implements OtpGenerator {
  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
