import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOptions } from './config/typeorm.config';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { UserRole } from './roles/user-role.entity';
import { Blob } from './blobs/blob.entity';
import { BlobData } from './blob-data/blob-data.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOptions),
    TypeOrmModule.forFeature([User, Role, UserRole, Blob, BlobData]),
  ],
})
export class AppModule {}
