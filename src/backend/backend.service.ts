import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageConfig } from './storage-config.entity';
import { Backend } from 'src/common/types/backend';

@Injectable()
export class BackendService {
  constructor(
    @InjectRepository(StorageConfig)
    private readonly configRepo: Repository<StorageConfig>,
  ) {}

  async changeBackend(backend: Backend) {
    await this.configRepo.save({ key: 'current_backend', value: backend });
    return { message: `Backend changed to ${backend}` };
  }

  async getBackend(): Promise<{ backend: Backend }> {
    const record = await this.configRepo.findOne({
      where: { key: 'current_backend' },
    });
    return {
      backend: (record?.value as any) || 'fs',
    }; // default to fs if not set
  }
}
