import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { NumericOtpGenerator } from './numeric-otp.generator';
import { RedisOtpStore } from '../redis/redis-otp.store';
import { RedisModule } from '../redis/redis.module';
import { TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisModule,
    JwtModule.register({}), // secrets handled inside TokenService
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    NumericOtpGenerator,
    RedisOtpStore,
    TokenService,
    { provide: 'OtpStore', useExisting: RedisOtpStore },
    { provide: 'OtpGenerator', useExisting: NumericOtpGenerator },
  ],
  exports: [AuthService],
})
export class AuthModule {}
