// src/blobs/blobs.service.ts
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blob } from './blob.entity';
import { BlobData } from '../blob-data/blob-data.entity';
import { type BackendMap, BACKENDS } from '../storage/storage.tokens';
import { BackendService } from 'src/backend/backend.service';

@Injectable()
export class BlobsService {
  constructor(
    @InjectRepository(Blob) private readonly blobRepo: Repository<Blob>,
    @InjectRepository(BlobData)
    private readonly blobDataRepo: Repository<BlobData>,
    @Inject(BACKENDS) private readonly backends: BackendMap,
    private backendService: BackendService,
  ) {}

  private sanitizeId(id: string) {
    if (!/^[A-Za-z0-9._-]+$/.test(id))
      throw new BadRequestException('Invalid id');
    return id;
  }

  async createBlob(ownerId: string, id: string, data: string) {
    if (!ownerId) throw new BadRequestException('ownerId required');
    this.sanitizeId(id);
    if (!data?.length) throw new BadRequestException('Empty data');

    const exists = await this.blobRepo.findOne({ where: { id } });
    if (exists) throw new ConflictException('Blob id already exists');

    const buf = Buffer.from(data, 'base64');
    const size = buf.length;

    const currentBackend = (await this.backendService.getBackend()).backend;
    const backend = this.backends[currentBackend];

    if (!backend)
      throw new InternalServerErrorException(
        `Backend ${currentBackend} not available`,
      );

    await backend.put(id, buf);

    const meta = this.blobRepo.create({
      id,
      ownerId,
      size,
      backend: backend.name,
    });
    await this.blobRepo.save(meta);

    return {
      id: meta.id,
      ownerId: meta.ownerId,
      size: meta.size,
      backend: meta.backend,
      created_at: meta.createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }

  async getBlob(ownerId: string, id: string) {
    this.sanitizeId(id);
    const meta = await this.blobRepo.findOne({ where: { id, ownerId } });
    if (!meta) throw new NotFoundException('Blob not found');

    const backend = this.backends[meta.backend as keyof BackendMap];
    if (!backend)
      throw new InternalServerErrorException(
        `Backend ${meta.backend} not available`,
      );

    const bytes = await backend.get(id);

    return {
      id: meta.id,
      data: bytes,
      size: meta.size,
      createdAt: meta.createdAt,
    };
  }

  async deleteBlob(ownerId: string, id: string) {
    this.sanitizeId(id);
    const meta = await this.blobRepo.findOne({ where: { id, ownerId } });
    if (!meta) throw new NotFoundException('Blob not found');

    const backend = this.backends[meta.backend as keyof BackendMap];
    if (!backend)
      throw new InternalServerErrorException(
        `Backend ${meta.backend} not available`,
      );

    await backend.remove(id);
    await this.blobRepo.delete({ id, ownerId });
    return true;
  }
}
