import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ok } from 'src/common/helpers/responses';

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('otp/request')
  async request(@Body('phone') phone: string) {
    await this.svc.requestOtp(phone);
    return Ok();
  }

  @Post('otp/verify')
  async verify(@Body() body: { phone: string; code: string }) {
    const data = await this.svc.verifyOtp(body.phone, body.code);
    return Ok({ data });
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refresh_token: string) {
    const data = await this.svc.refresh(refresh_token);
    return Ok({ data });
  }
}
