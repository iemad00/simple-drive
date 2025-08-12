import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlobData } from '../blob-data/blob-data.entity';
import { FsBackend } from './fs.backend';
import { DbBackend } from './db.backend';
import { S3HttpBackend } from './s3-http.backend';
import { BACKENDS } from './storage.tokens';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([BlobData])],
  providers: [
    // Concrete instances
    {
      provide: 'BACKEND_FS',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new FsBackend(cfg.get('DATA_DIR') || './storage'),
    },
    {
      provide: 'BACKEND_DB',
      inject: [getRepositoryToken(BlobData)],
      useFactory: (blobDataRepo) => new DbBackend(blobDataRepo),
    },
    {
      provide: 'BACKEND_S3',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new S3HttpBackend(
          cfg.getOrThrow('S3_ENDPOINT'),
          cfg.get('S3_REGION', 'us-east-1'),
          cfg.getOrThrow('S3_BUCKET'),
          cfg.getOrThrow('S3_ACCESS_KEY'),
          cfg.getOrThrow('S3_SECRET_KEY'),
          cfg.get('S3_SESSION_TOKEN'),
        ),
    },
    // Registry (map)
    {
      provide: BACKENDS,
      inject: ['BACKEND_FS', 'BACKEND_DB', 'BACKEND_S3'],
      useFactory: (fs: FsBackend, db: DbBackend, s3: S3HttpBackend) => ({
        fs,
        db,
        s3,
        ftp: undefined,
      }),
    },
  ],
  exports: [BACKENDS],
})
export class StorageModule {}
