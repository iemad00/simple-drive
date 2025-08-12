import { promises as fs } from 'fs';
import * as path from 'path';
import { BlobBackend } from './blob-backend';

export class FsBackend extends BlobBackend {
  readonly name = 'fs' as const;
  constructor(private readonly rootDir: string) {
    super();
  }

  private filePath(id: string) {
    return path.join(this.rootDir, id);
  }

  protected async doPut(id: string, data: Buffer) {
    await fs.mkdir(this.rootDir, { recursive: true });
    await fs.writeFile(this.filePath(id), data);
  }
  protected async doGet(id: string) {
    return fs.readFile(this.filePath(id));
  }
  protected async doRemove(id: string) {
    await fs.unlink(this.filePath(id)).catch(() => void 0);
  }
}
