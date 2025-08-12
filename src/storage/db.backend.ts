import { BlobBackend } from './blob-backend';
import { Repository } from 'typeorm';
import { BlobData } from '../blob-data/blob-data.entity';

export class DbBackend extends BlobBackend {
  readonly name = 'db' as const;
  constructor(private readonly blobDataRepo: Repository<BlobData>) {
    super();
  }

  protected async doPut(id: string, data: Buffer) {
    await this.blobDataRepo.save(this.blobDataRepo.create({ id, bytes: data }));
  }
  protected async doGet(id: string) {
    const row = await this.blobDataRepo.findOne({ where: { id } });
    if (!row) throw new Error('Blob data missing in database');
    return row.bytes;
  }
  protected async doRemove(id: string) {
    await this.blobDataRepo.delete({ id });
  }
}
