import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOptions } from './config/typeorm.config';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { UserRole } from './roles/user-role.entity';
import { Blob } from './blobs/blob.entity';
import { BlobData } from './blob-data/blob-data.entity';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { BlobsController } from './blobs/blobs.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOptions),
    TypeOrmModule.forFeature([User, Role, UserRole, Blob, BlobData]),
    RedisModule,
    AuthModule,
  ],
  controllers: [BlobsController],
})
export class AppModule {}
