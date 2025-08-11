import { Injectable } from '@nestjs/common';
import { OtpGenerator } from '../common/types/otp';

@Injectable()
export class NumericOtpGenerator implements OtpGenerator {
  generate(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
