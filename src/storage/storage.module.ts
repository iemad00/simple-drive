import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlobData } from '../blob-data/blob-data.entity';
import { FsBackend } from './fs.backend';
import { DbBackend } from './db.backend';
import { S3HttpBackend } from './s3-http.backend';
import { BACKENDS } from './storage.tokens';
import { FtpBackend } from './ftp.backend';

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
    {
      provide: 'BACKEND_FTP',
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) =>
        new FtpBackend(
          cfg.getOrThrow('FTP_HOST'),
          cfg.getOrThrow('FTP_USER'),
          cfg.getOrThrow('FTP_PASS'),
          Number(cfg.get('FTP_PORT', 21)),
          ((): any => {
            const v = cfg.get('FTP_SECURE', 'false');
            return v === 'true' ? true : v === 'implicit' ? 'implicit' : false;
          })(),
          cfg.get('FTP_SECURE_REJECT_UNAUTHORIZED', 'true') !== 'false',
          cfg.get('FTP_BASE_DIR', '/simple-drive'),
        ),
    },
    // Registry (map)
    {
      provide: BACKENDS,
      inject: ['BACKEND_FS', 'BACKEND_DB', 'BACKEND_S3', 'BACKEND_FTP'],
      useFactory: (
        fs: FsBackend,
        db: DbBackend,
        s3: S3HttpBackend,
        ftp: FtpBackend,
      ) => ({
        fs,
        db,
        s3,
        ftp,
      }),
    },
  ],
  exports: [BACKENDS],
})
export class StorageModule {}
