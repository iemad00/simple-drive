import { promises as fs } from 'fs';
import * as path from 'path';
import { BlobBackend } from './blob-backend';

export class FsBackend extends BlobBackend {
  readonly name = 'fs' as const;

  constructor(private readonly rootDir: string) {
    super();
  }

  private resolvePath(id: string) {
    // Normalize and resolve to absolute path
    const candidate = path.resolve(this.rootDir, id);
    // Prevent escaping DATA_DIR
    const root = path.resolve(this.rootDir);
    if (!candidate.startsWith(root + path.sep) && candidate !== root) {
      throw new Error('Invalid path resolution');
    }
    return candidate;
  }

  private async ensureRoot() {
    await fs.mkdir(this.rootDir, { recursive: true });
  }

  protected async doPut(id: string, data: Buffer) {
    await this.ensureRoot();
    const p = this.resolvePath(id);

    // atomic-ish write to avoid partial files
    const tmp = p + '.tmp';
    await fs.writeFile(tmp, data, { mode: 0o600 }); // private-ish file perms
    await fs.rename(tmp, p);
  }

  protected async doGet(id: string): Promise<Buffer> {
    const p = this.resolvePath(id);
    return fs.readFile(p);
  }

  protected async doRemove(id: string) {
    const p = this.resolvePath(id);
    await fs.unlink(p).catch(() => void 0);
  }
}
