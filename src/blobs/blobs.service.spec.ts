import { Test, TestingModule } from '@nestjs/testing';
import { BlobsService } from './blobs.service';

describe('BlobsService', () => {
  let service: BlobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlobsService],
    }).compile();

    service = module.get<BlobsService>(BlobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
