import { Backend } from 'src/common/types/backend';
import { BlobBackend } from './blob-backend';
// import { signV4 } from './s3-signv4.util';
// import { request as undici } from 'undici';

export class S3HttpBackend extends BlobBackend {
  name: Backend;
  protected doPut(id: string, data: Buffer): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected doGet(id: string): Promise<Buffer> {
    throw new Error('Method not implemented.');
  }
  protected doRemove(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  constructor() {
    super();
  }

  private url(id: string) {
    // return `${this.endpoint}/${this.bucket}/${id}`;
  }
}
