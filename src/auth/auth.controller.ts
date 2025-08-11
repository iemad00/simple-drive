import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('otp/request')
  request(@Body('phone') phone: string) {
    return this.svc.requestOtp(phone);
  }

  @Post('otp/verify')
  verify(@Body() body: { phone: string; code: string }) {
    return this.svc.verifyOtp(body.phone, body.code);
  }

  @Post('refresh')
  refresh(@Body('refresh_token') refresh_token: string) {
    return this.svc.refresh(refresh_token);
  }
}
